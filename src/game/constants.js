export const COLS = 10
export const ROWS = 20
export const CELL = 30

// Vivid, saturated 16-bit / SNES-era palette.
export const COLORS = {
  I: '#27d3ee',
  O: '#ffd11a',
  T: '#c64fff',
  S: '#3fe04f',
  Z: '#ff3b6b',
  J: '#2f6bff',
  L: '#ff8a1e',
}

export const SHAPES = {
  I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
  S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
  Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
  J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
  L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
}

export const KEYS = Object.keys(SHAPES)

// Line-clear score multipliers keyed by number of lines cleared.
export const LINE_SCORES = [0, 100, 300, 500, 800]

export function computeDropMs(level) {
  return Math.max(80, 800 - (level - 1) * 70)
}
