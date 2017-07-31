const R = require('ramda');
const sqlite3 = require('sqlite3').verbose();

const api = require('./api.js');

function all(db, query, params) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function get(db, query, params) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, res) => {
      if (err) reject(err);
      else if (res === undefined) throw new Error('query returned no results');
      else resolve(res);
    });
  });
}

const throttleRate = 1000; // msecs
function sleepPromise(x) {
  return new Promise(resolve => setTimeout(() => resolve(x), throttleRate));
}

function sequencePromiseThunks(promiseThunks) {
  const f = (promise, promiseThunk) => promise.then(promiseThunk);
  return R.reduce(f, Promise.resolve(), promiseThunks);
}

function throttle(promiseThunks) {
  const throttledThunks = R.intersperse(x => sleepPromise(x), promiseThunks);
  return sequencePromiseThunks(throttledThunks);
}

function updateFromApi() {
  const db = new sqlite3.Database('db.sqlite');
  const genThunk =
    id =>
      accum =>
        api.getRelevantSubmissions(id)
          .then(res => R.append(res, accum));

  const table = new Map();
  const lookup = (userId) => {
    if (table.has(userId)) return Promise.resolve(table[userId]);
    return get(db, 'SELECT id from user where aoj_id == ?', [userId])
      .then((res) => {
        table[userId] = res.id;
        return res.id;
      });
  };

  return all(db, 'SELECT aoj_id AS id FROM user', [])
    .then(R.map(row => genThunk(row.id)))
    .then(throttle)
    .then((res) => {
      const stmt = db.prepare(`
        INSERT OR IGNORE INTO problem (
          judge_id, status, user_id, date
        ) VALUES (
          ?, ?, ?, ?
        );
      `);

      const updates = res.map((probs) => {
        if (probs.length === 0) return Promise.resolve();
        return lookup(R.toLower(probs[0].userId))
          .then((id) => {
            probs.forEach((prob) => {
              stmt.run(prob.judgeId, prob.status, id, prob.submissionDate);
            });
          });
      });

      return Promise.all(updates)
        .then(() => {
          stmt.finalize();
          return res;
        });
    })
    .catch(console.error)
    .then((res) => {
      db.close();
      return res;
    });
}

module.exports = {
  updateFromApi,
};
