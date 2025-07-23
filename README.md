# synthetic.software

A Hugo-based personal website featuring automated feed processing and blogroll generation.

## Overview

This project contains the source code for synthetic.software, a personal website that combines:

- A Hugo static site generator setup
- Custom Go tools for content automation
- Cloudflare Workers deployment
- Nix development environment

## Architecture

- **Hugo Site**: Static site generator configuration with custom themes and layouts
- **Feed Processor**: Go tool that processes text files from a queue into Hugo content with automatic tagging
- **Blogroll Generator**: Go tool that fetches RSS feeds and generates YAML data files
- **Cloudflare Worker**: Simple static asset serving worker

## Project Structure

```
content/          # Hugo content (articles, notes, feed items)
layouts/          # Hugo templates and partials
static/           # Static assets (fonts, images, icons)
tools/            # Go automation tools
  cmd/            # Command-line applications
  internal/       # Shared Go packages
src/              # Cloudflare Worker source
```

## Development

The project uses devenv for development environment management.

### Prerequisites

- Nix

### Setup

```bash
devenv shell
hugo-dev
```

## Content Management

The site supports multiple content types:

- **Articles**: Long-form technical content
- **Feed**: Short-form posts processed from text files
- **Notes**: Curated links and brief observations
- **Blogroll**: Automatically generated from RSS feeds

Feed items are processed from text files placed in the `queue/` directory, with automatic tag extraction and Hugo frontmatter generation.

## Deployment

The site is deployed to Cloudflare Pages with a custom worker for static asset serving.
