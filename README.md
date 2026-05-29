# Cat Tetris 🐱🧱

A classic Tetris game built with vanilla HTML, CSS, and JavaScript — featuring a
playful cat companion who reacts to how the game is going, plus fireworks on line
clears.

## Play

It's a static site — no build step. Just open `index.html` in a browser, or serve
the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
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

Pure static site — deploys to Vercel with zero configuration (no framework, no
build command, output directory is the repo root).

## License

MIT
