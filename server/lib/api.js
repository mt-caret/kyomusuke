const R = require('ramda');
const fetch = require('node-fetch');
const moment = require('moment');

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

function hitAPI(url) {
  return fetch(url).then(res => res.json());
}

function getAllSubmissions(userId) {
  const url =
    `${endpoint}/submission_records/users/${userId}?size=${maxProblemCount}`;
  return hitAPI(url)
    .then(R.map(extract));
}

function getRelevantSubmissions(userId) {
  return getAllSubmissions(userId)
    .then(R.filter(validate));
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
  getRelevantSubmissions,
  lookupJudgeVerdict,
  dateStart,
  dateEnd,
  judgeVerdicts: R.values(judgeVerdictsMap),
};
