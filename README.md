# synthetic.software

Source for [synthetic.software](https://synthetic.software), my personal site. A SvelteKit static site with a few TypeScript tools that generate content at build time, deployed to Cloudflare Workers, developed under Nix.

## Structure

```
src/
  content/         # org-mode content (articles, notes)
  lib/components/  # Svelte components
  routes/          # SvelteKit routes
  scripts/         # build automation (version, blogroll, changelog)
static/            # fonts, images, icons
build/             # build output
```

Content is written in org-mode and processed at build time. Articles are long-form; notes are short links and observations; the blogroll is generated from RSS feeds.

## Development

Uses [devenv](https://devenv.sh), so you'll need [Nix](https://determinate.systems/) and devenv. Entering the shell prints the full command list (`syn` reprints it). The main ones:

```bash
install       # install dependencies
dev           # dev server at http://localhost:5173, with HMR
build         # quick build, no content generation
build-full    # full build with content generation
serve         # build-full + preview
generate      # run content generation only
check         # type check
lint          # lint
format        # format
```

## Build

`build` is for iteration. `build-full` is for production and additionally runs the generation scripts (version, blogroll, changelog), syncs SvelteKit routes, builds with Vite, and strips JS for static-only output. Output lands in `build/`.

## Deployment

Cloudflare Workers serves the static assets from `build/`, configured in `wrangler.jsonc`.
