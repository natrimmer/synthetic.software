{
  pkgs,
  ...
}:

{
  #----------------------------------------------------------------------------
  # Basic Environment Setup
  #----------------------------------------------------------------------------
  env.GREET = "synthethic.software";

  #----------------------------------------------------------------------------
  # Languages and Packages
  #----------------------------------------------------------------------------
  languages = {
    go.enable = true;
  };

  packages = [
    pkgs.git
    pkgs.nixd
    pkgs.golangci-lint
    pkgs.hugo
    # pkgs.wrangler
    pkgs.tailwindcss_4
  ];

  #----------------------------------------------------------------------------
  # Scripts and Shell Hooks
  #----------------------------------------------------------------------------
  scripts = {
    hello.exec = ''
      echo hello from $GREET
    '';

    # Logging helper functions
    _log.exec = ''
      # Usage: _log ACTION "message" [details]
      ACTION="$1"
      MESSAGE="$2"
      DETAILS="$3"

      # Color codes
      BOLD='\033[1m'
      RESET='\033[0m'
      BLUE='\033[34m'
      GREEN='\033[32m'
      YELLOW='\033[33m'
      RED='\033[31m'
      GRAY='\033[90m'

      # Action colors
      case "$ACTION" in
        "BUILD"|"HUGO") COLOR=$BLUE ;;
        "OK"|"DONE") COLOR=$GREEN ;;
        "WARN"|"INFO"|"AUTH"|"LOGS") COLOR=$YELLOW ;;
        "ERROR"|"FAIL") COLOR=$RED ;;
        "SERVER"|"DEPLOY") COLOR=$BLUE ;;
        *) COLOR=$GRAY ;;
      esac

      # Format: [ACTION] message
      printf "''${BOLD}''${COLOR}[%-8s]''${RESET} %s\n" "$ACTION" "$MESSAGE"

      # Add details if provided
      if [ -n "$DETAILS" ]; then
        printf "''${GRAY}          %s''${RESET}\n" "$DETAILS"
      fi
    '';

    _section.exec = ''
      # Usage: _section "Section Title"
      TITLE="$1"
      BOLD='\033[1m'
      RESET='\033[0m'
      BLUE='\033[34m'

      echo
      printf "''${BOLD}''${BLUE}=== %s ===''${RESET}\n" "$TITLE"
    '';

    _step.exec = ''
      # Usage: _step "step description"
      STEP="$1"
      GRAY='\033[90m'
      RESET='\033[0m'

      printf "''${GRAY}    → %s''${RESET}\n" "$STEP"
    '';

    feed-processor-build.exec = ''
      _log BUILD "feed-processor"
      mkdir -p tools/bin
      go build -o tools/bin/feed-processor ./tools/cmd/feed-processor
    '';

    blogroll-generator-build.exec = ''
      _log BUILD "blogroll-generator"
      mkdir -p tools/bin
      go build -o tools/bin/blogroll-generator ./tools/cmd/blogroll-generator
    '';

    changelog-generator-build.exec = ''
      _log BUILD "changelog-generator" >&2
      mkdir -p tools/bin
      go build -o tools/bin/changelog-generator ./tools/cmd/changelog-generator
    '';

    feed-processor-run.exec = ''
      feed-processor-build
      ./tools/bin/feed-processor "$@"
    '';

    blogroll-generator-run.exec = ''
      blogroll-generator-build
      ./tools/bin/blogroll-generator "$@"
    '';

    changelog-generator-run.exec = ''
      changelog-generator-build
      ./tools/bin/changelog-generator "$@"
    '';

    tools-build.exec = ''
      _section "Building Hugo Tools"
      _step "feed-processor"
      feed-processor-build
      _step "blogroll-generator"
      blogroll-generator-build
      _step "changelog-generator"
      changelog-generator-build
      _log OK "All tools built"
    '';

    tools-clean.exec = ''
      _log CLEAN "Hugo tools"
      rm -rf tools/bin
      go clean ./tools/...
      _log OK "Tools cleaned"
    '';

    tools-test.exec = ''
      _log TEST "Hugo tools"
      go test ./tools/... -v
    '';

    tools-lint.exec = ''
      _log LINT "Hugo tools"
      golangci-lint run ./tools/...
    '';

    tools-check.exec = ''
      _section "Tool Quality Checks"
      _step "Running linter"
      tools-lint
      _step "Running tests"
      tools-test
      _log OK "All checks passed"
    '';

    hugo-process-feeds.exec = ''
      _log PROCESS "Feed queue"
      mkdir -p queue
      if [ "$(ls -A queue 2>/dev/null)" ]; then
        ITEM_COUNT=$(ls queue | wc -l)
        _step "Processing $ITEM_COUNT feed items"
        feed-processor-run queue content/feed --verbose
        _log OK "Feed processing complete"
      else
        _log INFO "No feed items to process"
      fi
    '';

    hugo-update-blogroll.exec = ''
      _log UPDATE "Blogroll from feeds"
      blogroll-generator-run
      _log OK "Blogroll updated"
    '';

    hugo-update-changelog.exec = ''
      _log UPDATE "Changelog from git history"
      changelog-generator-run > data/changelog.yaml
      _log OK "Changelog updated"
    '';

    hugo-build.exec = ''
      _section "Hugo Site Build"

      # Process content
      _step "Processing feeds"
      hugo-process-feeds
      _step "Updating blogroll"
      hugo-update-blogroll
      _step "Updating changelog"
      hugo-update-changelog

      # Set git info for Hugo
      export HUGO_GIT_COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
      export HUGO_GIT_COMMIT_HASH_FULL=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
      export HUGO_BUILD_DATE=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
      export HUGO_VERSION=$(git describe --tags --exact-match 2>/dev/null || git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0-dev")

      # Build Hugo site
      _step "Building site"
      _log HUGO "Compiling with minification"
      hugo --minify --enableGitInfo

      _log DONE "Site build complete"
    '';

    feed-add.exec = ''
      if [ $# -eq 0 ]; then
        echo "Usage: feed-add \"Your feed content here\" [tag1] [tag2] ..."
        echo "Example: feed-add \"Working on Hugo feed system\" hugo development"
        exit 1
      fi

      content="$1"
      shift

      # Add hashtags for additional arguments
      for tag in "$@"; do
        content="$content #$tag"
      done

      # Create timestamped file
      timestamp=$(date +%s)
      filename="queue/$timestamp.txt"

      mkdir -p queue
      echo "$content" > "$filename"
      _log ADD "Feed item created" "$filename"
      _step "Content: $content"

      # Auto-process if Hugo dev server is running
      if pgrep -f "hugo server" > /dev/null; then
        _log AUTO "Processing feeds..."
        hugo-process-feeds
      fi
    '';

    hugo-dev.exec = ''
      _section "Hugo Development Server"

      # Process existing content
      _step "Processing existing content"
      hugo-process-feeds
      hugo-update-blogroll
      hugo-update-changelog

      # Set git info for Hugo
      export HUGO_GIT_COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
      export HUGO_GIT_COMMIT_HASH_FULL=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
      export HUGO_BUILD_DATE=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
      export HUGO_VERSION=$(git describe --tags --exact-match 2>/dev/null || git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0-dev")

      _log SERVER "Starting at http://localhost:1313"
      _log INFO "Add feed items: feed-add \"Your content\" tag1 tag2"
      _log INFO "Press Ctrl+C to stop"

      hugo server --bind 0.0.0.0 --port 1313 --buildDrafts --buildFuture --disableFastRender --enableGitInfo
    '';

    workers-auth.exec = ''
      _log AUTH "Cloudflare Workers"
      wrangler auth login
      _log OK "Authentication complete"
    '';

    workers-whoami.exec = ''
      _log INFO "Current Cloudflare account"
      wrangler whoami
    '';

    workers-dev.exec = ''
      _section "Workers Development"
      _step "Building Hugo site first"
      hugo-build
      _step "Starting Workers dev server"
      _log SERVER "Starting at http://localhost:8787"
      wrangler dev --local --port 8787
    '';

    workers-deploy-dry.exec = ''
      _section "Workers Deployment (Dry Run)"
      _step "Building Hugo site"
      hugo-build
      _step "Checking deployment"
      wrangler deploy --dry-run --compatibility-date 2025-04-01
    '';

    workers-deploy.exec = ''
      _section "Workers Deployment"
      _step "Building Hugo site"
      hugo-build
      _step "Deploying to Cloudflare"
      wrangler deploy --compatibility-date 2025-04-01
      _log DONE "Site deployed successfully"
    '';

    workers-logs.exec = ''
      _log LOGS "Workers runtime logs"
      wrangler tail
    '';

    # Version management scripts
    _get-current-version.exec = ''
      # Get current version from git tags, default to v0.0.0 if none exist
      CURRENT=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
      echo "$CURRENT"
    '';

    _bump-version.exec = ''
      # Usage: _bump-version [major|minor|patch]
      BUMP_TYPE="$1"

      if [ -z "$BUMP_TYPE" ]; then
        echo "Usage: _bump-version [major|minor|patch]"
        exit 1
      fi

      CURRENT=$(_get-current-version)
      _log INFO "Current version: $CURRENT"

      # Remove 'v' prefix and split version
      VERSION=''${CURRENT#v}
      MAJOR=$(echo "$VERSION" | cut -d. -f1)
      MINOR=$(echo "$VERSION" | cut -d. -f2)
      PATCH=$(echo "$VERSION" | cut -d. -f3)

      # Bump appropriate component
      case "$BUMP_TYPE" in
        "major")
          MAJOR=$((MAJOR + 1))
          MINOR=0
          PATCH=0
          ;;
        "minor")
          MINOR=$((MINOR + 1))
          PATCH=0
          ;;
        "patch")
          PATCH=$((PATCH + 1))
          ;;
        *)
          _log ERROR "Invalid bump type: $BUMP_TYPE"
          exit 1
          ;;
      esac

      NEW_VERSION="v$MAJOR.$MINOR.$PATCH"

      # Check if working directory is clean
      if ! git diff-index --quiet HEAD --; then
        _log WARN "Working directory has uncommitted changes"
        echo "Please commit your changes before creating a version tag."
        exit 1
      fi

      # Create the tag
      _log TAG "Creating $NEW_VERSION"
      git tag -a "$NEW_VERSION" -m "Release $NEW_VERSION"

      _log OK "Version bumped: $CURRENT → $NEW_VERSION"
      _log INFO "Push with: git push origin $NEW_VERSION"
    '';

    major.exec = ''
      _section "Major Version Bump"
      _step "This will create a new major version (breaking changes)"
      _bump-version major
    '';

    minor.exec = ''
      _section "Minor Version Bump"
      _step "This will create a new minor version (new features)"
      _bump-version minor
    '';

    patch.exec = ''
      _section "Patch Version Bump"
      _step "This will create a new patch version (fixes and small updates)"
      _bump-version patch
    '';

    commands.exec = ''
      _section "Available Commands"
      echo ""
      echo "Individual tools:"
      echo "∘ feed-processor-build     - Build feed processor"
      echo "∘ feed-processor-run       - Run feed processor"
      echo "∘ blogroll-generator-build - Build blogroll generator"
      echo "∘ blogroll-generator-run   - Run blogroll generator"
      echo "∘ changelog-generator-build - Build changelog generator"
      echo "∘ changelog-generator-run   - Run changelog generator"
      echo ""
      echo "Tool ecosystem:"
      echo "∘ tools-build              - Build all tools"
      echo "∘ tools-clean              - Clean tool binaries"
      echo "∘ tools-test               - Test all tools"
      echo "∘ tools-lint               - Lint all tools"
      echo "∘ tools-check              - Run lint + test"
      echo ""
      echo "Hugo workflows:"
      echo "∘ hugo-process-feeds       - Process feed queue"
      echo "∘ hugo-update-blogroll     - Update blogroll from feeds"
      echo "∘ hugo-update-changelog    - Update changelog from git history"
      echo "∘ hugo-build               - Build complete Hugo site"
      echo "∘ hugo-dev                 - Start Hugo dev server"
      echo "∘ feed-add                 - Add feed item (feed-add \"content\" tag1 tag2)"
      echo ""
      echo "Cloudflare Workers:"
      echo "∘ workers-auth             - Authenticate with Cloudflare"
      echo "∘ workers-whoami           - Show current account"
      echo "∘ workers-dev              - Build + start Workers dev server"
      echo "∘ workers-deploy-dry       - Test deployment (dry run)"
      echo "∘ workers-deploy           - Deploy to production"
      echo "∘ workers-logs             - Watch runtime logs"
      echo ""
      echo "Version management:"
      echo "∘ major                    - Bump major version"
      echo "∘ minor                    - Bump minor version"
      echo "∘ patch                    - Bump patch version"
      echo ""
      echo "Help:"
      echo "∘ commands                 - Show this command list"
      echo ""
    '';
  };

  enterShell = ''
    echo ""
    echo ""
    hello
    echo ""
    commands
  '';

  enterTest = ''
    echo "Running tests"
    go version
  '';

  #----------------------------------------------------------------------------
  # Tasks
  #----------------------------------------------------------------------------

  #----------------------------------------------------------------------------
  # Git Hooks
  #----------------------------------------------------------------------------
  git-hooks.hooks = {
    #----------------------------------------
    # Formatting Hooks - Run First
    #----------------------------------------
    beautysh.enable = true; # Format shell files
    gofmt.enable = true; # Format Go code
    nixfmt-rfc-style.enable = true; # Format Nix code

    #----------------------------------------
    # Linting Hooks - Run After Formatting
    #----------------------------------------
    shellcheck.enable = true; # Lint shell scripts
    golangci-lint.enable = true; # Lint Go code
    statix.enable = true; # Lint Nix code
    deadnix.enable = true; # Find unused Nix code

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
