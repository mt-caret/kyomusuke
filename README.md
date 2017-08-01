# kyomusuke

進捗を可視化するやつ

## dependencies

- Nix Package Manager
- nothing else; node stuff, sqlite3, etc. will be take care by Nix

## dev

```
$ nix-shell --command 'yarn install; return' # will drop you into a dev env shell
[nix-shell]$ bash bin/init-db.sh
[nix-shell]$ bash bin/add-user.sh [aoj_user_id] # add a user
[nix-shell]$ node bin/hit-api.js # access AOJ API and populate database
```

## TODO

### frontend

- [x] webpack production build env
- [x] integrate with frontend
- [x] App.elm
- [ ] proper date support
- [ ] status colors
- [ ] debug mode

### backend

- [x] SQLite schema
- [x] bin/init-db.sh
- [x] bin/add-user.sh
- [x] bin/hit-api.js
- [x] create API
- [x] worker that queries AOJ API (w/ node-schedule)
- [ ] cache the response with ex. node-cache?
- [ ] deploy
- [ ] debug mode

### misc

- [ ] document production deployment workflow

