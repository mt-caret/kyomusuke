CREATE TABLE problem (
  judge_id INTEGER PRIMARY KEY,
  status INTEGER,
  user_id INTEGER,
  date INTEGER
);

CREATE TABLE user (
  id INTEGER PRIMARY KEY,
  aoj_id TEXT UNIQUE
);
