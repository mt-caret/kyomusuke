const db = require('../server/lib/db.js');

db.updateFromApi()
  .then(JSON.stringify)
  .then(console.log);

