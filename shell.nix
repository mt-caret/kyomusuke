with import <nixpkgs> {}; {
  devEnv = stdenv.mkDerivation {
    name = "dev";
    buildInputs = [
      elmPackages.elm
      yarn
      nodejs
      sqlite
    ];
  };
}
