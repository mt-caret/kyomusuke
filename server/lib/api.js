const R = require('ramda');
const fetch = require('node-fetch');
const moment = require('moment');

const list = require('./list.js').list;

const endpoint = 'https://judgeapi.u-aizu.ac.jp';
const maxProblemCount = 5000;
// const dateStart = moment('2017-08-01');
// const dateEnd = moment('2017-09-01');
const dateStart = moment('2015-08-01');
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

function lookupJudgeVerdict(statusCode) {
  switch (statusCode) {
    case 0: return 'CE'; // Compile Error
    case 1: return 'WA'; // Wrong Answer
    case 2: return 'TLE'; // Time Limit Exceeded
    case 3: return 'MLE'; // Memory Limit Exceeded
    case 4: return 'AC'; // Accepted
    // case 5: return '???'; // undocumented statusCode code
    case 6: return 'OLU'; // Output Limit Exceeded
    case 7: return 'RE'; // Runtime Error
    case 8: return 'PE'; // Presentation Error
    default: throw new Error(`invalid statusCode lookup: ${statusCode}`);
  }
}

module.exports = {
  getRelevantSubmissions,
  lookupJudgeVerdict,
};
