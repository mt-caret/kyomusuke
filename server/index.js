const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackConfig = require('../webpack.dev.js');

const api = require('./lib/api.js');
const list = require('./lib/list.js').list;

const development = process.env.NODE_ENV !== 'production';

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
