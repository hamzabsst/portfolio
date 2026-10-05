# Hamza Boussetta — Portfolio

Live website: https://hamzabsst.me/

A static HTML, CSS, and JavaScript portfolio with a dark theme, animated
character, selected projects, and interactive browser demos.

## Editing

- `index.html`: homepage structure and text
- `styles.css`: base styling, character animation and responsive layout
- `features.css`: project interactions, demos, copy-email control and study
  pages
- `content.js`: email, résumé, project descriptions
- `script.js` / `eye-tracking.js`: content, scroll reveals, character and motion
  control
- `intro-story.js` / `intro-story.css`: shared character transition from the
  hero to About, with a normal-flow mobile and reduced-motion fallback
- `js/features.js`: entry point for retained interactive features
- `js/ui.js`: clipboard feedback
- `js/motion.js`: shared pause, visibility and reduced-motion policy
- `js/project-interactions.js`: Minishell walkthrough
- `js/irc-demo.js`: two-client chat and IRC connection walkthrough
- `js/irc-model.js`: safe channel-message routing for the browser simulation
- `js/*-model.js` / `js/*-demo.js`: simulation models and browser controls
- `projects/`: source-based project studies; homepage links the selected
  projects and demos
- `assets/`: character, résumé, favicon, social preview and benchmark data

## Local preview

Run `python3 -m http.server 8765 --bind 127.0.0.1` and open
http://localhost:8765/.

## Checks

Run `node tests/models.test.mjs`, `node tests/motion.test.mjs` and
`node tests/intro-story.test.mjs` and `node tests/irc.test.mjs` (Node 22+). No
package install is required.

Browser demos are JavaScript models, labeled separately from the C/C++
implementations. The push_swap study includes measured native C operation counts
and complete inputs in `assets/push-swap-benchmark.json`. Reproduce with
`python3 scripts/benchmark-push-swap.py /path/to/push_swap`. This updates the
JSON; update the study table when publishing new measurements.

The pause button, reduced-motion preference and tab visibility control
animation. Manual demo steps remain available with motion paused. The eye
controller cleans up listeners and restores itself when the browser restores a
cached page.

## Vercel

The repository is connected to Vercel. Pushes to `main` automatically deploy.
Use the Other framework preset, no build command, and the repository root as
output directory.
