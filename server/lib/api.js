const R = require('ramda');
const fetch = require('node-fetch');
const moment = require('moment');
const xml2js = require('xml2js');

const list = require('./list.js').list;

const endpoint = 'https://judgeapi.u-aizu.ac.jp';
const maxProblemCount = 5000;
const dateStart = moment('2017-08-01');
const dateEnd = moment('2017-09-01');

function validate(sub) {
  const timestamp = parseInt(sub.submissionDate, 10);
  return R.contains(sub.problemId, list) &&
    moment(timestamp).isBetween(dateStart, dateEnd);
}

function extract(sub) {
  return R.pick([
    'judgeId',
    'userId',
    'problemId',
    'submissionDate',
    'status',
  ], sub);
}

function hitJsonApi(url) {
  return fetch(url).then(res => res.json());
}

function hitXmlApi(url) {
  return fetch(url)
    .then(res => res.text())
    .then(res => {
      return new Promise((resolve, reject) => {
        xml2js.parseString(res, { trim: true }, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });
    });
}

function getAllSubmissions(userId) {
  const url =
    `${endpoint}/submission_records/users/${userId}?size=${maxProblemCount}`;
  return hitJsonApi(url)
    .then(R.map(extract));
}

function getRelevantSubmissions(userId) {
  return getAllSubmissions(userId)
    .then(R.filter(validate));
}

function hitDeprecatedApi(userId) {
  // this retrieves all solved problems
  const oldEndpoint = 'http://judge.u-aizu.ac.jp';
  const url =
    `${oldEndpoint}/onlinejudge/webservice/solved_record?user_id=${userId}`;
  return hitXmlApi(url)
    .then(res => R.defaultTo([], res.solved_record_list.solved))
    .then(R.map(record => {
      return {
        judgeId: parseInt(record.run_id[0], 10),
        userId: record.user_id[0],
        problemId: record.problem_id[0],
        submissionDate: parseInt(record.date[0], 10),
        status: 4,
      };
    }));
}

function getRelevantSubmissionsWithDeprecatedApi(userId) {
  return hitDeprecatedApi(userId)
   .then(R.filter(validate));
}

function doesUserExist(userId) {
  const url =
    `${endpoint}/users/${userId}`;
  return hitJsonApi(url).then(res => res.id === userId);
}

function doesUserExistWithDeprecatedApi(userId) {
  const oldEndpoint = 'http://judge.u-aizu.ac.jp';
  const url =
    `${oldEndpoint}/onlinejudge/webservice/user?id=${userId}`;
  return hitXmlApi(url).then(res => res.user.id !== undefined);
}

const judgeVerdictsMap = {
  0: 'CE', // Compile Error
  1: 'WA', // Wrong Answer
  2: 'TLE', // Time Limit Exceeded
  3: 'MLE', // Memory Limit Exceeded
  4: 'AC', // Accepted
  // 5: '???', // undocumented statusCode code
  6: 'OLU', // Output Limit Exceeded
  7: 'RE', // Runtime Error
  8: 'PE', // Presentation Error
};

function lookupJudgeVerdict(statusCode) {
  if (R.isNil(judgeVerdictsMap[statusCode])) {
    throw new Error(`invalid statusCode lookup: ${statusCode}`);
  }
  return judgeVerdictsMap[statusCode];
}

module.exports = {
  doesUserExist: doesUserExistWithDeprecatedApi,
  hitDeprecatedApi,
  getRelevantSubmissions: getRelevantSubmissionsWithDeprecatedApi,
  lookupJudgeVerdict,
  dateStart,
  dateEnd,
  judgeVerdicts: R.values(judgeVerdictsMap),
};
