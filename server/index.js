const express = require('express');
const webpack = require('webpack');
const schedule = require('node-schedule');
const moment = require('moment');
const R = require('ramda');
const webpackMiddleware = require('webpack-dev-middleware');

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
  // production config (static?)
}

function dateToPath(date) {
  return R.map(x => date.format(x), ['YYYY', 'MM', 'DD']);
}

function iterateDaily(start, end, f) {
  for (let d = start; d.isSameOrBefore(end); d.add(1, 'days')) f(d);
}

const baseVerdict = R.fromPairs(R.map(v => [v, 0], api.judgeVerdicts));
function constructBaseObject() {
  let ret = {};
  iterateDaily(api.dateStart, api.endDate, (d) => {
    ret = R.assocPath(dateToPath(d), baseVerdict, ret);
  });
  return ret;
}
const baseObject = constructBaseObject();

function dbCallToObject() {
  return db.fetchAllProblems()
    .then((probs) => {
      const groupedProbs = R.groupBy(R.prop('aoj_id'), probs);
      return R.mapObjIndexed((records) => {
        const f = (prevResult, newRecord) => {
          const verdict = api.lookupJudgeVerdict(newRecord.status);
          const path = R.append(verdict, dateToPath(moment(newRecord.date)));
          return R.assocPath(path, R.path(path, prevResult) + 1, prevResult);
        };
        return R.reduce(f, baseObject, records);
      }, groupedProbs);
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

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
