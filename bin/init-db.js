const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('db.sqlite');

db.serialize(() => {
  db.run('CREATE TABLE lorem (info TEXT)');

  const stmt = db.prepare('INSERT INTO lorem VALUES (?)');
  for (let i = 0; i < 10; i += 1) {
    stmt.run(`Ipsum ${i}`);
  }
  stmt.finalize();

  db.each('SELECT rowid AS id, info FROM lorem', (err, row) => {
    console.log(`${row.id}: ${row.info}`);
  });
});

db.close();

/*
 *  SCHEMA:
 *    problems:
 *      id (primary): INTEGER,
 *      status : INTEGER, # from AOJ-API
 *      user_id : INTEGER,
 *      date (UNIX_TIME) : INTEGER # from AOJ-API
 *    users:
 *      id (primary) : INTEGER,
 *      aoj_id : TEXT
*/
