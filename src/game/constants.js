export const COLS = 10
export const ROWS = 20
export const CELL = 30

export const COLORS = {
  I: '#6ee7ff',
  O: '#ffd966',
  T: '#c084fc',
  S: '#7ee787',
  Z: '#ff8aa8',
  J: '#7aa8ff',
  L: '#ffb172',
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
