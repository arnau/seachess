let
  pkgs = import <nixpkgs> {};
  environment = [
    pkgs.editorconfig-core-c # configure editor per project.
    pkgs.exa                 # ls replacement.
    pkgs.git                 # version control.
    pkgs.ripgrep             # grep replacement.
    pkgs.skim                # fuzzy finder.
    pkgs.tealdeer            # man replacement.
    pkgs.yarn                # javascript package manager.
  ];
  experimental = [];

  inputs = environment ++ experimental;
in
  if pkgs.lib.inNixShell
  then pkgs.mkShell
    {
      buildInputs = inputs;
      shellHook = ''
        set -o vi
        local pink='\e[1;35m'
        local yellow='\e[1;33m'
        local blue='\e[1;36m'
        local white='\e[0;37m'
        local reset='\e[0m'

        git_branch() {
          git rev-parse --abbrev-ref HEAD 2>/dev/null
        }

        export PS1="\[$pink\]nix \[$blue\]\W \[$yellow\]\$(git_branch)\[$white\] ∙ \[$reset\]"

        alias ls=exa
      '';
    }
  else
    inputs
