# Hamza Boussetta — Portfolio

Live website: https://hamzabsst.vercel.app/

A static portfolio built with HTML, CSS, and JavaScript.

## Editing

- `index.html`: structure and page text
- `styles.css`: styling
- `script.js`: content rendering, scroll reveals, motion controls, and portrait movement
- `eye-tracking.js`: reusable eye-tracking controller and its cleanup function
- `character-component.html`: standalone character markup for reuse
- `content.js`: email, resume link, and project descriptions
- `assets/`: character image and resume PDF

## Local preview

Run `python3 -m http.server 8765 --bind 127.0.0.1` from this folder and open http://localhost:8765/.

## Vercel

Use the Other framework preset, no build command, and the repository root as the output directory. This repository is connected to the existing Vercel project. Pushes to `main` automatically deploy to production.

## Character animation

The SVG contains both the character image and its eye overlays so they inherit the same transforms. Eye positions and movement limits are set with `data-eye-x`, `data-eye-y`, and `data-eye-radius` in the markup.

`eye-tracking.js` reads the current SVG transform on each active frame, clamps pupil offsets, and smooths movement. Its named constants control smoothing and the idle timeout. The returned cleanup function removes listeners and cancels animation frames.

The pause button and reduced-motion preference control the animations. Hidden pages suspend eye tracking, and cached-page navigation restores it.

## Interactive features

- `features.css`: interactive panels, responsive layouts, and light-theme overrides
- `js/features.js`: feature entry point
- `js/ui.js` / `js/terminal.js`: command palette, theme, clipboard, and navigation terminal
- `js/motion.js`: shared pause, visibility, and reduced-motion policy
- `js/project-interactions.js`: Minishell stages and Inception source inspector
- `js/*-model.js`: pure simulation models; `*-demo.js`: their browser controls
- `js/github.js`: public GitHub API activity with static fallback and an 8-second timeout
- `projects/`: six static, directly linkable source-based studies
- `notes/`: technical explanations with source links

The terminal accepts only predefined navigation commands; it never executes visitor input. Live demos run in JavaScript and are labeled separately from the C implementations. A cub3D WebAssembly port is not included.

Project copy and Dockerfile snippets are in `content.js`; static article text is in `projects/` and `notes/`. Source links pin the reviewed commits. The studies use verified design decisions and code edge cases, without invented personal stories or memory-check screenshots.

## Checks and measurements

Run `node tests/models.test.mjs` for operation replay, sorting, input boundaries, fork ownership, and starvation checks. No package install is required (Node 22+).

The push_swap study includes measured native C operation counts, with full inputs and checker results in `assets/push-swap-benchmark.json`. Reproduce with `python3 scripts/benchmark-push-swap.py /path/to/push_swap`. This builds that checkout and updates the JSON; update the static article table if you publish new measurements.

The Open Graph image is `assets/social-preview.png` (1200×630). The favicon is `assets/favicon.svg`. Theme selection is saved locally; clipboard denial shows a fallback message. GitHub uses only public unauthenticated data and reports unavailable activity without hiding repository links.
