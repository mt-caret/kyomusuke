const fetch = require('node-fetch');

const endpoint = 'https://judgeapi.u-aizu.ac.jp';

// string -> string -> Promise Object
function hitAPI(userId, problemId) {
  const url =
    `${endpoint}/submission_records/users/${userId}/problems/${problemId}`;

  return fetch(url)
    .then(res => res.json());
}

module.exports = {
  hitAPI,
};
