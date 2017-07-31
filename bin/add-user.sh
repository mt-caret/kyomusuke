#!/bin/bash

if [[ $# -ne 1 ]]; then
  echo "usage: $0 [user_id]"
  exit 1
fi

URL="https://judgeapi.u-aizu.ac.jp/users/$1"
CURL=$(curl -sS --fail "$URL" 2>&1)
if [ $? -ne 0 ]; then
  echo "$URL: $CURL"
  exit 1
fi

USER_ID=$(echo "$CURL" | jq -r '.id')
QUERY="INSERT INTO user (aoj_id) VALUES ('$USER_ID');"
echo "adding user $USER_ID with '$QUERY' ..."
echo "$QUERY" | sqlite3 db.sqlite
