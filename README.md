# kyomusuke backend

各位の進捗を可視化するやつのフロントエンド

## dependencies

- Nix Package Manager
- nothing else, node stuff will be take care by above

## dev

```
$ nix-shell --command 'yarn install; return' # will drop you into a dev env shell
```

## TODO

- [ ] SQLite schema
- [ ] bin/init-db.js
- [ ] create API
- [ ] worker that queries AOJ API
- [ ] cache the response with ex. node-cache?
- [ ] deploy

