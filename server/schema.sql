CREATE TABLE problem (
  judge_id INTEGER PRIMARY KEY,
  problem_id TEXT,
  status INTEGER,
  user_id INTEGER,
  date INTEGER
);

CREATE TABLE user (
  id INTEGER PRIMARY KEY,
  aoj_id TEXT UNIQUE
);
