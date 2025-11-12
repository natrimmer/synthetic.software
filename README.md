# synthetic.software

## Overview

This project contains the source code for synthetic.software, a personal website that combines:

- A SvelteKit static site generator
- Custom TypeScript tools for content automation
- Cloudflare Workers deployment
- Nix development environment

## Architecture

- **SvelteKit Site**: Static site generator with TypeScript components and server-side rendering
- **Blogroll Generator**: TypeScript tool that fetches RSS feeds and generates YAML data files
- **Changelog Generator**: TypeScript tool that parses git history and generates version changelog
- **Cloudflare Worker**: Static asset serving worker

## Project Structure

```
src/
  content/              # Markdown content (articles, notes, feed items)
  lib/components/       # Svelte components
  routes/               # SvelteKit routes
  scripts/              # Build automation scripts
static/                 # Static assets (fonts, images, icons)
build/                  # Build output directory
```

## Development

The project uses devenv for development environment management.

### Prerequisites

- Nix (I'm a fan of [Determinate Nix](https://determinate.systems/))
- [devenv.sh](https://devenv.sh)

### Setup

```bash
dev
```

The development server will be available at `http://localhost:5173` with hot module replacement.

## Content Management

The site supports multiple content types:

- **Articles**: Long-form technical content (`.svx` files with frontmatter)
- **Feed**: Short-form posts organized by date
- **Notes**: Curated links and brief observations
- **Blogroll**: Automatically generated from RSS feeds

All content is written in Markdown with frontmatter and processed at build time.

## Build

Build the SvelteKit site:

```bash
build
```

The build process:

1. Runs prebuild scripts (version, blogroll, changelog generation)
2. Syncs SvelteKit routes
3. Builds the site with Vite
4. Removes JavaScript files (static-only output)

Build output is in `syn_svelte/build/`.

## Deployment

The site is deployed to Cloudflare Workers with static asset serving.

The worker serves static assets from `build/` as configured in `wrangler.jsonc`.

## Migration from Hugo

This project was previously built with Hugo and has been migrated to SvelteKit. The migration resulted in:

- 55% smaller build output
- 63% smaller HTML per page
- Better developer experience with TypeScript throughout
- Better tooling (Vite HMR, Prettier, ESLint)

See `src/content/articles/hugo_to_sveltekit.svx` for the full migration report and benchmarks.
