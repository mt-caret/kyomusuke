const express = require('express');
const bodyParser = require('body-parser');
const webpack = require('webpack');
const schedule = require('node-schedule');
const moment = require('moment');
const R = require('ramda');
const { spawn } = require('child_process');
const webpackMiddleware = require('webpack-dev-middleware');
const fs = require('fs');
const yaml = require('js-yaml');

const configText = fs.readFileSync(`${__dirname}/../config.yml`, 'utf8');
const config = yaml.safeLoad(configText);

const webpackConfig = require('../webpack.dev.js');

const api = require('./lib/api.js');
const db = require('./lib/db.js');
const list = require('./lib/list.js').list;

const development = process.env.NODE_ENV !== 'production';

const job = schedule.scheduleJob({ minute: 0 }, db.updateFromApi);

const app = express();

if (development) {
  const middlewareConfig = {
    publicPath: webpackConfig.devServer.publicPath,
    stats: {
      colors: true,
    },
  };
  app.use(webpackMiddleware(webpack(webpackConfig), middlewareConfig));
} else {
  app.use(express.static('dist'));
}

app.use(bodyParser.json());

const baseVerdictResult = R.fromPairs(R.map(v => [v, 0], api.judgeVerdicts));
function dbCallToObject() {
  return db.fetchAllProblems()
    .then((probs) => {
      const groupedProbs = R.groupBy(R.prop('aoj_id'), probs);
      const pairs = R.toPairs(R.mapObjIndexed((records, key, obj) => {
        const f = (prevResult, newRecord) => {
          const verdict = api.lookupJudgeVerdict(newRecord.status);
          const propName = moment(newRecord.date).format('YYYY-MM-DD');
          const base = R.defaultTo(baseVerdictResult, prevResult[propName]);
          return R.assoc(propName, R.assoc(verdict, base[verdict] + 1, base), prevResult);
        };
        const pairs = R.toPairs(R.reduce(f, {}, records));
        return R.map(([date, verdicts]) => ({ date, verdicts }), pairs);
      }, groupedProbs));
      return R.map(([userId, data]) => ({ userId, data }), pairs);
    });
}

app.get('/stats', (req, res) => {
  res.format({
    json: () => {
      dbCallToObject()
        .then(obj => res.send(obj));
    },
  });
});

app.get('/users', (req, res) => {
  res.format({
    json: () => {
      db.fetchAllUsers()
        .then(obj => res.send(obj));
    },
  });
});

app.post('/add', (req, res) => {
  res.format({
    json: () => {
      const valid = R.any(R.equals(req.body.keyword), config.keywords);
      console.log(req.body);
      if (valid) {
        console.log('adding stuff');
        spawn('bash', ['./bin/add-user.sh', req.body.userId])
          .on('close', (code) => {
            console.log({ code });
            res.send({ code, status: 'success' });
          });
      } else {
        res.status(401);
        res.send({ status: 'keyword mismatch' });
      }
    },
  });
});

app.listen(3000, () => {
  console.log('kyomusuke listening on port 3000!');
});
