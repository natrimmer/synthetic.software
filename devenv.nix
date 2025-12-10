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

    # Dependency management
    install.exec = ''
      pnpm install
    '';

    # Build commands
    build.exec = ''
      pnpm run build
    '';

    build-full.exec = ''
      pnpm run build:full
    '';

    generate.exec = ''
      pnpm run generate
    '';

    # Development
    dev.exec = ''
      pnpm run dev
    '';

    preview.exec = ''
      pnpm run preview
    '';

    # Convenience combos
    serve.exec = ''
      pnpm run build:full
      pnpm run preview
    '';

    # Quality checks
    check.exec = ''
      pnpm run check
    '';

    lint.exec = ''
      pnpm run lint
    '';

    format.exec = ''
      pnpm run format
    '';

    # Version management
    patch.exec = ''
      # Get the latest tag
      LATEST_TAG=$(git tag --sort=-v:refname | head -n 1)
      if [ -z "$LATEST_TAG" ]; then
        echo "No existing tags found. Creating v0.0.1"
        NEW_TAG="v0.0.1"
      else
        # Parse version components
        VERSION=''${LATEST_TAG#v}
        IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"
        PATCH=$((PATCH + 1))
        NEW_TAG="v$MAJOR.$MINOR.$PATCH"
      fi

      echo "Current tag: $LATEST_TAG"
      echo "New tag: $NEW_TAG"
      read -p "Create and push tag $NEW_TAG? (y/n) " -n 1 -r
      echo
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        git tag "$NEW_TAG"
        echo "Tag $NEW_TAG created"
        read -p "Push tag to remote? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
          git push origin "$NEW_TAG"
          echo "Tag $NEW_TAG pushed"
        fi
      else
        echo "Aborted"
      fi
    '';

    minor.exec = ''
      # Get the latest tag
      LATEST_TAG=$(git tag --sort=-v:refname | head -n 1)
      if [ -z "$LATEST_TAG" ]; then
        echo "No existing tags found. Creating v0.1.0"
        NEW_TAG="v0.1.0"
      else
        # Parse version components
        VERSION=''${LATEST_TAG#v}
        IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"
        MINOR=$((MINOR + 1))
        NEW_TAG="v$MAJOR.$MINOR.0"
      fi

      echo "Current tag: $LATEST_TAG"
      echo "New tag: $NEW_TAG"
      read -p "Create and push tag $NEW_TAG? (y/n) " -n 1 -r
      echo
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        git tag "$NEW_TAG"
        echo "Tag $NEW_TAG created"
        read -p "Push tag to remote? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
          git push origin "$NEW_TAG"
          echo "Tag $NEW_TAG pushed"
        fi
      else
        echo "Aborted"
      fi
    '';

    major.exec = ''
      # Get the latest tag
      LATEST_TAG=$(git tag --sort=-v:refname | head -n 1)
      if [ -z "$LATEST_TAG" ]; then
        echo "No existing tags found. Creating v1.0.0"
        NEW_TAG="v1.0.0"
      else
        # Parse version components
        VERSION=''${LATEST_TAG#v}
        IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"
        MAJOR=$((MAJOR + 1))
        NEW_TAG="v$MAJOR.0.0"
      fi

      echo "Current tag: $LATEST_TAG"
      echo "New tag: $NEW_TAG"
      read -p "Create and push tag $NEW_TAG? (y/n) " -n 1 -r
      echo
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        git tag "$NEW_TAG"
        echo "Tag $NEW_TAG created"
        read -p "Push tag to remote? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
          git push origin "$NEW_TAG"
          echo "Tag $NEW_TAG pushed"
        fi
      else
        echo "Aborted"
      fi
    '';

    commands.exec = ''
      echo "Available commands:"
      echo ""
      echo "Dependencies:"
      echo "  install     - Install/update dependencies"
      echo ""
      echo "Build:"
      echo "  build       - Quick build (no content generation)"
      echo "  build-full  - Full build with content generation"
      echo "  generate    - Run content generation scripts only"
      echo ""
      echo "Development:"
      echo "  dev         - Start development server"
      echo "  preview     - Preview production build (run build first)"
      echo "  serve       - Full build + preview (convenience combo)"
      echo ""
      echo "Quality:"
      echo "  check       - Run type checks"
      echo "  lint        - Run linter"
      echo "  format      - Format code"
      echo ""
      echo "Versioning:"
      echo "  patch       - Increment patch version and tag (e.g., v2.0.5 -> v2.0.6)"
      echo "  minor       - Increment minor version and tag (e.g., v2.0.5 -> v2.1.0)"
      echo "  major       - Increment major version and tag (e.g., v2.0.5 -> v3.0.0)"
      echo ""
      echo "Other:"
      echo "  hello       - Greet from the environment"
      echo "  commands    - Show this help"
    '';
  };

  enterShell = ''
    echo ""
    echo ""
    hello
    commands
    echo ""
    echo "💡 Tip: Run 'install' first if you haven't already"
    echo ""
    echo ""
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
