with import <nixpkgs> {}; {
  devEnv = stdenv.mkDerivation {
    name = "dev";
    buildInputs = [
      yarn
      nodejs
      sqlite
    ];
  };
}
