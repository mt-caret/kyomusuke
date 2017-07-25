const express = require('express');

const api = require('./lib/api.js');
const list = require('./lib/list.js').list;

const app = express();

app.get('/stats', (req, res) => {
  res.format({
    json: () => {
      res.send({
        it: 'works!',
      });
    },
  });
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

console.dir(list);
