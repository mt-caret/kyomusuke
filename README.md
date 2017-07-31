# kyomusuke backend

各位の進捗を可視化するやつのフロントエンド

## dependencies

- Nix Package Manager
- nothing else, node stuff, sqlite3, etc. will be take care by above

## dev

```
$ nix-shell --command 'yarn install; return' # will drop you into a dev env shell
[nix-shell]$ bash bin/init-db.sh
[nix-shell]$ bash bin/add-user.sh [aoj_user_id] # add a user
[nix-shell]$ node bin/hit-api.js # access AOJ API and populate database
```

initialize db with `node --harmony bin/init-db.js`

## TODO

### frontend

- [x] webpack production build env
- [x] integrate with frontend
- [ ] App.elm

### backend

- [x] SQLite schema
- [x] bin/init-db.sh
- [x] bin/add-user.sh
- [x] bin/hit-api.js
- [ ] create API
- [ ] worker that queries AOJ API (w/ node-schedule)
- [ ] cache the response with ex. node-cache?
- [ ] deploy

