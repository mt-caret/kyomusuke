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

function run(db, query, params) {
  return new Promise((resolve, reject) => {
    db.run(query, params, (err) => {
      if (err) reject(err);
      else resolve();
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

function openDB(f) {
  const db = new sqlite3.Database('db.sqlite');
  return Promise.resolve(db)
    .then(f)
    .then((res) => {
      db.close();
      return res;
    }, (err) => {
      db.close();
      throw err;
    });
}

function updateFromApi() {
  const genThunk =
    id =>
      accum =>
        api.getRelevantSubmissions(id)
          .then(res => R.append(res, accum));

  const table = new Map();

  return openDB((db) => {
    const lookup = (userId) => {
      if (table.has(userId)) return Promise.resolve(table[userId]);
      return get(db, 'SELECT id FROM user WHERE aoj_id == ?', [userId])
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
            judge_id, problem_id, status, user_id, date
          ) VALUES (
            ?, ?, ?, ?, ?
          );
        `);

        const updates = res.map((probs) => {
          if (probs.length === 0) return Promise.resolve();
          return lookup(R.toLower(probs[0].userId))
            .then((id) => {
              probs.forEach((prob) => {
                stmt.run(prob.judgeId, prob.problemId, prob.status, id, prob.submissionDate);
              });
            });
        });

        return Promise.all(updates)
          .then(() => {
            stmt.finalize();
            return res;
          });
      });
  });
}

function fetchAllProblems() {
  const query = `
    SELECT status, date, aoj_id
    FROM problem JOIN user ON problem.user_id == user.id
    ORDER BY date ASC
  `;
  return openDB(db => all(db, query));
}

function fetchAllUsers() {
  const query = `
    SELECT aoj_id
    FROM user
  `;
  return openDB(db => all(db, query))
    .then(R.map(R.prop('aoj_id')));
}

function addUser(userId) {
  const query = 'INSERT OR IGNORE INTO user (aoj_id) VALUES (?)';
  return openDB(db => run(db, query, [userId]));
}

module.exports = {
  updateFromApi,
  fetchAllProblems,
  fetchAllUsers,
  addUser,
};
