{ pkgs, inputs, ... }:
let
  pkgs-unstable = import inputs.nixpkgs-unstable { inherit (pkgs.stdenv) system; };
in
{
  #----------------------------------------------------------------------------
  # Basic Environment Setup
  #----------------------------------------------------------------------------
  env.GREET = "gnat";

  #----------------------------------------------------------------------------
  # Languages and Packages
  #----------------------------------------------------------------------------
  # Go environment
  languages.go.enable = true;
  packages = [
    pkgs.golangci-lint
    pkgs.hugo
    pkgs.tailwindcss_4
    pkgs.git
    pkgs.nixd
    pkgs-unstable.prettier
    pkgs.prettier-plugin-go-template
  ];

  #----------------------------------------------------------------------------
  # Scripts and Shell Hooks
  #----------------------------------------------------------------------------
  scripts = {
    hello.exec = ''
      echo hello from $GREET
    '';

    # Hugo feed system scripts
    hugo-build.exec = ''
      echo "🔄 Processing feed files..."

      # Create queue directory if it doesn't exist
      mkdir -p queue

      # Build the Go processor if it doesn't exist or is outdated
      if [ ! -f "./feed-processor" ] || [ "feed-processor.go" -nt "./feed-processor" ]; then
        echo "🔨 Building feed processor..."
        go build -o feed-processor feed-processor.go
      fi

      # Process any files in the queue
      if [ "$(ls -A queue 2>/dev/null)" ]; then
        echo "📝 Processing $(ls queue | wc -l) feed items..."
        ./feed-processor queue content/feed --verbose
        echo "✅ Feed processing complete"
      else
        echo "📭 No feed items to process"
      fi

      # Build Hugo site
      echo "🏗️  Building Hugo site..."
      hugo --minify

      echo "✅ Build complete!"
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
      echo "📝 Added feed item: $filename"
      echo "Content: $content"

      # Auto-process if Hugo dev server is running
      if pgrep -f "hugo server" > /dev/null; then
        echo "🔄 Auto-processing..."
        if [ ! -f "./feed-processor" ]; then
          go build -o feed-processor feed-processor.go
        fi
        ./feed-processor queue content/feed --verbose
      fi
    '';

    hugo-dev.exec = ''
      echo "🚀 Starting Hugo development server with feed processing..."

      # Build the processor
      if [ ! -f "./feed-processor" ] || [ "feed-processor.go" -nt "./feed-processor" ]; then
        echo "🔨 Building feed processor..."
        go build -o feed-processor feed-processor.go
      fi

      # Create queue directory
      mkdir -p queue

      # Process any existing files
      if [ "$(ls -A queue 2>/dev/null)" ]; then
        echo "📝 Processing existing feed items..."
        ./feed-processor queue content/feed --verbose
      fi

      echo "🌐 Starting Hugo dev server at http://localhost:1313"
      echo "💡 Add feed items: feed-add \"Your content\" tag1 tag2"
      echo "🛑 Press Ctrl+C to stop"

      hugo server --bind 0.0.0.0 --port 1313 --buildDrafts --buildFuture --disableFastRender
    '';

    build.exec = ''
      VERSION=$(git describe --tags --always --dirty 2>/dev/null || echo "v0.0.0-dev")
      BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
      COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

      echo "Building gnat $VERSION"
      go build -ldflags "-X main.version=$VERSION -X main.buildDate=$BUILD_DATE -X main.commitSHA=$COMMIT_SHA" -o gnat .
    '';

    build-release.exec = ''
      VERSION=$(git describe --tags --always --dirty 2>/dev/null || echo "v0.0.0-dev")
      BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
      COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

      echo "Building gnat $VERSION (release)"
      CGO_ENABLED=0 go build -ldflags "-w -s -X main.version=$VERSION -X main.buildDate=$BUILD_DATE -X main.commitSHA=$COMMIT_SHA" -o gnat .
    '';

    version.exec = ''
      VERSION=$(git describe --tags --always --dirty 2>/dev/null || echo "v0.0.0-dev")
      BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
      COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

      echo "Version: $VERSION"
      echo "Build Date: $BUILD_DATE"
      echo "Commit: $COMMIT_SHA"
    '';

    test-code.exec = ''
      go test ./... -v
    '';

    test-coverage.exec = ''
      go test ./... -cover -coverprofile=coverage.out
      go tool cover -html=coverage.out -o coverage.html
      echo "Coverage report generated: coverage.html"
    '';

    test-race.exec = ''
      go test ./... -race
    '';

    bench.exec = ''
      go test ./... -bench=. -benchmem
    '';

    lint.exec = ''
      golangci-lint run
    '';

    fmt.exec = ''
      go fmt ./...
    '';

    vet.exec = ''
      go vet ./...
    '';

    clean.exec = ''
      rm -f gnat
      rm -f coverage.out coverage.html
      go clean -testcache
    '';

    ci.exec = ''
      echo "Running CI checks..."
      golangci-lint run
      go vet ./...
      go test ./... -race
      go test ./... -cover
      echo "All CI checks passed!"
    '';

    test-binary.exec = ''
      ./build
      echo "Testing built binary:"
      ./gnat --version
      ./gnat --help
    '';

    major.exec = ''
      # Check if working directory is clean
      if [ -n "$(git status --porcelain)" ]; then
        echo "Error: Working directory is not clean. Please commit or stash changes first."
        exit 1
      fi

      # Get current version
      CURRENT_VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
      echo "Current version: $CURRENT_VERSION"

      # Parse version and increment major
      NEW_VERSION=$(echo "$CURRENT_VERSION" | sed -E 's/^v?([0-9]+)\.([0-9]+)\.([0-9]+).*/v\1.\2.\3/' | awk -F. '{print "v" ($1+1) ".0.0"}' | sed 's/^vv/v/')
      echo "New version: $NEW_VERSION"

      # Prompt for confirmation
      echo ""
      echo "This will create and push tag '$NEW_VERSION' which will trigger a release build."
      printf "Continue? (y/N): "
      read -r CONFIRM
      case "$CONFIRM" in
        [yY]|[yY][eE][sS])
          echo "Creating and pushing tag..."
          git tag "$NEW_VERSION"
          git push origin "$NEW_VERSION"
          echo "Tagged and pushed $NEW_VERSION"
          ;;
        *)
          echo "Cancelled."
          exit 0
          ;;
      esac
    '';

    minor.exec = ''
      # Check if working directory is clean
      if [ -n "$(git status --porcelain)" ]; then
        echo "Error: Working directory is not clean. Please commit or stash changes first."
        exit 1
      fi

      # Get current version
      CURRENT_VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
      echo "Current version: $CURRENT_VERSION"

      # Parse version and increment minor
      NEW_VERSION=$(echo "$CURRENT_VERSION" | sed -E 's/^v?([0-9]+)\.([0-9]+)\.([0-9]+).*/v\1.\2.\3/' | awk -F. '{print "v" $1 "." ($2+1) ".0"}' | sed 's/^vv/v/')
      echo "New version: $NEW_VERSION"

      # Prompt for confirmation
      echo ""
      echo "This will create and push tag '$NEW_VERSION' which will trigger a release build."
      printf "Continue? (y/N): "
      read -r CONFIRM
      case "$CONFIRM" in
        [yY]|[yY][eE][sS])
          echo "Creating and pushing tag..."
          git tag "$NEW_VERSION"
          git push origin "$NEW_VERSION"
          echo "Tagged and pushed $NEW_VERSION"
          ;;
        *)
          echo "Cancelled."
          exit 0
          ;;
      esac
    '';

    patch.exec = ''
      # Check if working directory is clean
      if [ -n "$(git status --porcelain)" ]; then
        echo "Error: Working directory is not clean. Please commit or stash changes first."
        exit 1
      fi

      # Get current version
      CURRENT_VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
      echo "Current version: $CURRENT_VERSION"

      # Parse version and increment patch
      NEW_VERSION=$(echo "$CURRENT_VERSION" | sed -E 's/^v?([0-9]+)\.([0-9]+)\.([0-9]+).*/v\1.\2.\3/' | awk -F. '{print "v" $1 "." $2 "." ($3+1)}' | sed 's/^vv/v/')
      echo "New version: $NEW_VERSION"

      # Prompt for confirmation
      echo ""
      echo "This will create and push tag '$NEW_VERSION' which will trigger a release build."
      printf "Continue? (y/N): "
      read -r CONFIRM
      case "$CONFIRM" in
        [yY]|[yY][eE][sS])
          echo "Creating and pushing tag..."
          git tag "$NEW_VERSION"
          git push origin "$NEW_VERSION"
          echo "Tagged and pushed $NEW_VERSION"
          ;;
        *)
          echo "Cancelled."
          exit 0
          ;;
      esac
    '';
  };

  enterShell = ''
    echo ""
    echo ""
    hello
    echo ""
    echo "Available commands:"
    echo "  build          - Build with version info"
    echo "  build-release  - Build optimized release binary"
    echo "  test-code      - Run tests"
    echo "  test-coverage  - Run tests with coverage"
    echo "  test-race      - Run tests with race detection"
    echo "  lint           - Run linter"
    echo "  fmt            - Format code"
    echo "  version        - Show version info"
    echo "  clean          - Clean build artifacts"
    echo "  ci             - Run all CI checks"
    echo ""
    echo "Hugo feed system:"
    echo "  hugo-build     - Process feed queue and build Hugo site"
    echo "  feed-add       - Add new feed item (feed-add \"content\" tag1 tag2)"
    echo "  hugo-dev       - Start Hugo dev server with auto-processing"
    echo ""
    echo "Version management:"
    echo "  major          - Increment major version (X.0.0)"
    echo "  minor          - Increment minor version (x.Y.0)"
    echo "  patch          - Increment patch version (x.y.Z)"
    echo ""
  '';

  enterTest = ''
    echo "Running tests"
    go --version
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
