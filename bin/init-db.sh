#!/bin/bash
set -e
sqlite3 db.sqlite < server/schema.sql
