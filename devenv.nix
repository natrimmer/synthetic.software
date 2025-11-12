{ pkgs, ... }:

{
  env.GREET = "synthetic.software";

  packages = [
    pkgs.git
    pkgs.nil
    pkgs.nixd
    pkgs.nodejs
    pkgs.pnpm
  ];

  languages.typescript.enable = true;

  scripts = {
    hello.exec = ''
      echo hello from $GREET
    '';

    build.exec = ''
      pnpm install
      pnpm run build:full
    '';

    dev.exec = ''
      pnpm install
      pnpm run dev
    '';

    serve.exec = ''
      pnpm install
      pnpm run build:full
      npx serve build
    '';

    check.exec = ''
      pnpm install
      pnpm run check
    '';

    lint.exec = ''
      pnpm install
      pnpm run lint
    '';

    format.exec = ''
      pnpm install
      pnpm run format
    '';

    commands.exec = ''
      echo "Available commands:"
      echo "  hello    - Greet from the environment"
      echo "  build    - Install dependencies and build the project"
      echo "  dev      - Install dependencies and start the development server"
      echo "  serve    - Install dependencies, build the project, and serve it"
      echo "  check    - Install dependencies and run type checks"
      echo "  lint     - Install dependencies and run the linter"
      echo "  format   - Install dependencies and format the code"
      echo "  commands - List available commands"
    '';
  };

  enterShell = ''
    hello
    commands
  '';

  git-hooks.hooks = {
    #----------------------------------------
    # Formatting Hooks - Run First
    #----------------------------------------
    beautysh.enable = true; # Format shell files
    nixfmt-rfc-style.enable = true; # Format Nix code
    prettier.enable = true; # Format code using Prettier

    #----------------------------------------
    # Linting Hooks - Run After Formatting
    #----------------------------------------
    actionlint.enable = true; # Static checker for GitHub Actions workflow files
    shellcheck.enable = true; # Lint shell scripts
    statix.enable = true; # Lint Nix code
    deadnix.enable = true; # Find unused Nix code
    eslint.enable = true; # Lint JavaScript/TypeScript code

    #----------------------------------------
    # Security & Safety Hooks
    #----------------------------------------
    detect-private-keys.enable = true; # Prevent committing private keys
    check-added-large-files.enable = true; # Prevent committing large files
    check-case-conflicts.enable = true; # Check for case-insensitive conflicts
    check-merge-conflicts.enable = true; # Check for merge conflict markers
    check-executables-have-shebangs.enable = true; # Ensure executables have shebangs
    check-shebang-scripts-are-executable.enable = true; # Ensure scripts with shebangs are executable
  };
}
