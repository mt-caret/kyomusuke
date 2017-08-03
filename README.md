# kyomusuke

進捗を可視化するやつ

## dependencies

- Nix Package Manager
- nothing else; node stuff, sqlite3, etc. will be take care by Nix

## dev

```
$ nix-shell --command 'yarn install; elm package install; return' # will drop you into a dev env shell
[nix-shell]$ bash bin/init-db.sh
[nix-shell]$ bash bin/add-user.sh [aoj_user_id] # add a user
[nix-shell]$ node bin/hit-api.js # access AOJ API and populate database
[nix-shell]$ touch config.yml # fill as needed
[nix-shell]$ yarn server # server/index.js runs with webpack-dev-server middleware
```

## prod

`$ yarn deploy`

## TODO

### frontend

- [x] webpack production build env
- [x] integrate with frontend
- [x] App.elm
- [x] add-user
- [ ] proper date support
- [ ] status colors
- [ ] debug mode (give NODE_ENV to Elm)

### backend

- [x] SQLite schema
- [x] bin/init-db.sh
- [x] bin/add-user.sh
- [x] bin/hit-api.js
- [x] create API
- [x] worker that queries AOJ API (w/ node-schedule)
- [x] deploy
- [x] add-user API
- [x] read from config file
- [ ] use js instead of shell exec to process user addition
- [ ] cache the response with ex. node-cache?
- [ ] debug mode

### misc

- [ ] query AtCoder problems too
- [ ] upload results to slack
- [x] document production deployment workflow

