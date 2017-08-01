const fs = require('fs');

const filepath = `${__dirname}/aoj-icpc-idlist.json`;
const content = fs.readFileSync(filepath, 'utf8');
const list = JSON.parse(content);

module.exports = {
  list,
};
