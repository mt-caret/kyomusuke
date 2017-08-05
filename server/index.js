const express = require('express');
const bodyParser = require('body-parser');
const webpack = require('webpack');
const schedule = require('node-schedule');
const moment = require('moment');
const R = require('ramda');
const Slack = require('slack-node');
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

let lastUpdateTime = {};
function updateDB() {
  db.updateFromApi()
    .then(() => {
      lastUpdateTime = {
        time: moment().format('YYYY-MM-DD HH:mm')
      };
    });
}
updateDB();

const updateDBJob = schedule.scheduleJob('*/10 * * * *', updateDB);
// execute job every 10 minutes

const slack = new Slack();
slack.setWebhook(config.slackWebhookUrl);
function postToSlack(message) {
  slack.webhook({
    channel: '#curriculum',
    username: 'kyomusuke',
    text: message,
    icon_url: 'http://kyomusuke.keio-ac.jp/kyomusuke.png',
  }, (err, res) => {
    if (err) console.error(err);
  });
}

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

function rankToSlack() {
  const today = moment().format('YYYY-MM-DD');
  const base = { verdicts: baseVerdictResult };
  return dbCallToObject()
    .then(R.map((record) => {
      const res = R.filter(d => d.date === today, record.data)[0];
      return [ R.defaultTo(base, res).verdicts.AC, record.userId ];
    }))
    .then(R.sortBy(R.prop(0)))
    .then(R.map(R.reverse))
    .then(R.reverse)
    .then((results) => {
      let message = `${today}のACランキング: ${'\n'}`;
      for (let i = 0; i < results.length; i += 1) {
        message += `${results[i][0]}: ${results[i][1]}${'\n'}`;
      }
      message += '日付変わるまであと三時間！まだACしてない人は急ごう！';
      return message;
    })
    .then(postToSlack);
}
const rankToSlackJob = schedule.scheduleJob('0 21 * * *', rankToSlack);

app.get('/stats', (req, res) => {
  res.format({
    json: () => {
      dbCallToObject()
        .then(obj => res.send(obj));
    },
  });
});

app.get('/lastUpdate', (req, res) => {
  res.format({
    json: () => res.send(lastUpdateTime),
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
      if (development) console.log({ body: req.body, config, valid });
      if (valid) {
        api.doesUserExist(req.body.userId)
          .then((userExists) => {
            if (!userExists) {
              res.status(401);
              res.send({ status: 'user does not exist' });
            } else {
              return db.addUser(req.body.userId)
                .then(() => res.send({ status: 'success' }));
            }
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
