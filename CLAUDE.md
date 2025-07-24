# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**synthetic.software** is a Hugo-based personal website with custom Go automation tools for content management, deployed via Cloudflare Workers. The project combines static site generation with automated feed processing and blogroll generation.

## Development Environment

This project uses Nix/devenv for environment management. All development commands are available through devenv scripts.

### Setup
```bash
devenv shell    # Enter development environment
hugo-dev        # Start development server with automatic content processing
```

## Common Development Commands

### Content Management
```bash
feed-add "content here" tag1 tag2    # Add new feed item to queue
hugo-process-feeds                   # Process pending feed items from queue/
hugo-update-blogroll                 # Update blogroll from RSS feeds
```

### Development Server
```bash
hugo-dev                            # Start Hugo dev server at localhost:1313
                                    # Automatically processes feeds and updates blogroll
                                    # Auto-processes new feed items when added
```

### Building and Testing
```bash
hugo-build                          # Full site build with content processing
tools-build                         # Build Go automation tools
tools-check                         # Run linting and tests for Go tools
tools-test                          # Run Go tool tests
tools-lint                          # Run golangci-lint on Go tools
```

### Deployment
```bash
workers-deploy                      # Deploy to Cloudflare Workers (production)
workers-deploy-dry                  # Test deployment (dry run)
workers-dev                         # Start Workers dev server at localhost:8787
workers-logs                        # Watch runtime logs
```

### Version Management
```bash
major                              # Bump major version (breaking changes)
minor                              # Bump minor version (new features)  
patch                              # Bump patch version (fixes)
```

## Architecture

### Content Processing System
- **Feed Processor** (`tools/cmd/feed-processor/`): Converts text files from `queue/` into Hugo content with automatic tagging and sequential IDs
- **Blogroll Generator** (`tools/cmd/blogroll-generator/`): Fetches RSS feeds listed in `static/assets/blogroll.txt` and generates YAML data

### Content Types
- **Articles** (`content/articles/`): Long-form technical content
- **Feed** (`content/feed/`): Short-form posts organized by date hierarchy
- **Notes** (`content/notes/`): Curated links and observations
- **Blogroll** (`content/blogroll.html`): Auto-generated from RSS feeds

### Hugo Configuration
- Base URL: `https://synthetic.software/`
- Taxonomies: tags, categories
- Minification enabled for all assets
- Git info integration for build metadata
- Tailwind CSS v4 for styling

### Deployment Stack
- **Static Site**: Hugo with custom Mondrian-inspired theme
- **Hosting**: Cloudflare Workers with static asset serving
- **Domain**: synthetic.software
- **Build Process**: Automated content processing → Hugo build → Worker deployment

## Content Workflow

1. **Feed Items**: Create text files in `queue/` → `hugo-process-feeds` converts to dated Hugo content
2. **Manual Content**: Add markdown files directly to `content/articles/` or `content/notes/`
3. **Blogroll**: Update `static/assets/blogroll.txt` → `hugo-update-blogroll` fetches RSS feeds
4. **Build**: `hugo-build` processes all content and generates static site
5. **Deploy**: `workers-deploy` uploads to Cloudflare

## File Structure

```
content/              # Hugo content organized by type
├── articles/         # Long-form posts
├── feed/            # Auto-processed short posts (YYYY/MM/DD structure)
├── notes/           # Curated content
└── blogroll.html    # Auto-generated blogroll page

tools/               # Go automation tools
├── cmd/             # CLI applications
│   ├── feed-processor/     # Text → Hugo content converter
│   └── blogroll-generator/ # RSS feed aggregator
└── internal/        # Shared Go packages

layouts/             # Hugo templates with Mondrian-inspired design
static/              # Static assets (fonts, images, icons)
src/index.js         # Cloudflare Worker
queue/               # Pending feed items (processed automatically)
```

## Development Notes

- The development server (`hugo-dev`) automatically processes new feed items when added via `feed-add`
- Git hooks handle formatting (gofmt, nixfmt), linting (golangci-lint, shellcheck), and security checks
- Version tags are used for Hugo build metadata and changelog generation
- All Go tools must pass linting and tests before deployment
- Feed items support hashtag-based tagging for automatic categorization

### Template Development

- All Hugo templates use whitespace control syntax (`{{-` and `-}}`) to eliminate unwanted whitespace in minified HTML output
- Templates are optimized for clean, compact HTML generation without aesthetic gaps
- When creating or modifying templates, always apply whitespace control around Hugo template functions (`{{partial}}`, `{{block}}`, `{{range}}`, `{{if}}`, `{{with}}`, etc.)