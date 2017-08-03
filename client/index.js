import 'sanitize.css';
import 'bootstrap/dist/css/bootstrap.css';
import moment from 'moment';

import Elm from './App.elm';
import './main.css';

const now = moment();

const flags = {
  year: now.year(),
  month: now.month()+1, // moment returns 0-indexed months
  day: now.date(),
  debug: process.env.NODE_ENV !== "production",
};

Elm.App.fullscreen(flags);
