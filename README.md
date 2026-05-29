# Cat Tetris 🐱🧱

A classic Tetris game built with **React + Vite** — featuring a playful cat
companion who reacts to how the game is going, plus fireworks on line clears.

## Develop

```bash
npm install
npm run dev      # start the Vite dev server (http://localhost:5173)
npm run build    # production build into dist/
npm run preview  # preview the production build locally
```

## Controls

| Key | Action |
| --- | --- |
| ← / → | Move |
| ↓ | Soft drop |
| ↑ | Rotate |
| Space | Hard drop |
| P | Pause |

## Features

- 7 classic tetrominoes with wall-kick rotation
- Ghost piece, next-piece preview, soft/hard drop
- Scoring, levels, and increasing speed
- A cat that thinks, concentrates, cheers, gets nervous, and cries
- Particle fireworks on line clears

## Deploy

Deploys to Vercel with zero configuration. Vercel auto-detects Vite — build
command `npm run build`, output directory `dist`.

## Project structure

```
src/
  main.jsx              # React entry
  App.jsx               # layout: cat panel, board, HUD, overlay
  styles.css            # all styling
  game/
    constants.js        # board dims, shapes, colors, scoring
    engine.js           # imperative game engine (grid, loop, render, fireworks)
  components/
    CatFace.jsx         # mood-driven SVG cat
  hooks/
    useTetris.js        # bridges the engine to React state + keyboard input
```

## License

MIT
