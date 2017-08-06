const R = require('ramda');
const db = require('../server/lib/db.js');
const api = require('../server/lib/api.js');

if (process.argv.length !== 3) {
  console.error(`usage: ${process.argv[0]} [user_id]`);
  process.exit(1);
}

const userId = R.toLower(process.argv[2]);

api.doesUserExist(userId)
  .then((userExist) => {
    if (!userExist) {
      console.error(`user ${userId} does not exist.`);
      process.exit(1);
    }
    return db.addUser(userId);
  })
  .then(() => console.log(`successfully added ${userId}.`));

