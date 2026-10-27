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
- `project-explorer.css` / `js/project-explorer.js`: searchable project index,
  topic controls, result feedback and reset behavior
- `js/project-search.js`: project and technology matching without dependencies
- `js/ui.js`: clipboard feedback
- `js/motion.js`: shared pause, visibility and reduced-motion policy
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

Run `node --test tests/*.test.mjs` (Node 22+). No package install is required.

## Project Explorer

The index above the featured projects links to the existing project sections
and lab demos. Search by name or technology (for example, `React`, `C++`,
`push swap` or `mutex`), then narrow the results with a topic filter. Search
and topic filters work together; Clear filters restores all five projects.
Links remain available with JavaScript disabled, and interactive controls only
appear after the explorer initializes. The search runs locally in the browser.

The compact directory takes inspiration from
[Brittany Chiang's project archive](https://brittanychiang.com/archive) and the
topic grouping of [Anthony Fu's projects](https://antfu.me/projects), using this
portfolio's own content and visual design.

## Interactive demos

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
