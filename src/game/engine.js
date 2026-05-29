import {
  COLS, ROWS, CELL, COLORS, SHAPES, KEYS, LINE_SCORES, computeDropMs,
} from './constants.js'

const FIREWORK_COLORS = ['#ffd966', '#ff8aa8', '#6ee7ff', '#c084fc', '#7ee787', '#ffb172']

const BUBBLES = {
  idle: 'meow',
  thinking: 'hmm…',
  concentrating: 'focus!',
  cheering: 'yaaay!',
  nervous: 'eek…',
  crying: 'nooo…',
}

/**
 * Imperative Tetris engine. Owns the grid, active piece, fireworks particles
 * and the requestAnimationFrame loop, and renders to the canvases handed to it.
 * Player-facing state (score, mood, next piece, …) is pushed to React through
 * the `onState` callback rather than touched on the DOM directly.
 */
export class TetrisEngine {
  constructor({ boardCanvas, fxCanvas, nextCanvas, onState }) {
    this.boardCtx = boardCanvas.getContext('2d')
    this.fxCtx = fxCanvas.getContext('2d')
    this.nextCtx = nextCanvas.getContext('2d')
    this.boardW = boardCanvas.width
    this.boardH = boardCanvas.height
    this.fxW = fxCanvas.width
    this.fxH = fxCanvas.height
    this.nextW = nextCanvas.width
    this.nextH = nextCanvas.height
    this.onState = onState

    this.grid = this.makeGrid()
    this.current = null
    this.nextPiece = null
    this.particles = []
    this.fireworkTimers = []

    this.score = 0
    this.lines = 0
    this.level = 1
    this.dropMs = computeDropMs(1)
    this.dropAccum = 0
    this.running = false
    this.paused = false
    this.gameOver = false

    this.mood = 'idle'
    this.animSeq = 0
    this.lastTime = 0
    this.rafId = null

    this.loop = this.loop.bind(this)
  }

  // ── lifecycle ──────────────────────────────────────
  mount() {
    this.emit()
    this.drawBoard()
    this.rafId = requestAnimationFrame(this.loop)
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId)
    this.fireworkTimers.forEach(clearTimeout)
    this.fireworkTimers = []
  }

  emit() {
    this.onState({
      score: this.score,
      lines: this.lines,
      level: this.level,
      running: this.running,
      paused: this.paused,
      gameOver: this.gameOver,
      mood: this.mood,
      bubble: BUBBLES[this.mood],
      animSeq: this.animSeq,
      nextType: this.nextPiece ? this.nextPiece.type : null,
    })
  }

  // ── state helpers ──────────────────────────────────
  makeGrid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  }

  setMood(mood, { animate = false } = {}) {
    const changed = mood !== this.mood
    this.mood = mood
    if (animate) this.animSeq += 1
    if (changed || animate) this.emit()
  }

  randomPiece() {
    const type = KEYS[Math.floor(Math.random() * KEYS.length)]
    const shape = SHAPES[type].map((row) => row.slice())
    return {
      type,
      shape,
      x: Math.floor((COLS - shape[0].length) / 2),
      y: type === 'I' ? -1 : 0,
    }
  }

  rotate(matrix) {
    const n = matrix.length
    const result = Array.from({ length: n }, () => Array(n).fill(0))
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) result[c][n - 1 - r] = matrix[r][c]
    }
    return result
  }

  collides(piece, dx = 0, dy = 0, shape = piece.shape) {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue
        const nx = piece.x + c + dx
        const ny = piece.y + r + dy
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true
        if (ny >= 0 && this.grid[ny][nx]) return true
      }
    }
    return false
  }

  // ── game flow ──────────────────────────────────────
  start() {
    this.grid = this.makeGrid()
    this.score = 0
    this.lines = 0
    this.level = 1
    this.dropMs = computeDropMs(1)
    this.dropAccum = 0
    this.running = true
    this.paused = false
    this.gameOver = false
    this.particles = []
    this.fireworkTimers.forEach(clearTimeout)
    this.fireworkTimers = []
    this.nextPiece = this.randomPiece()
    this.spawnNext()
    this.emit()
  }

  togglePause() {
    if (this.gameOver || !this.running) return
    this.paused = !this.paused
    this.emit()
  }

  spawnNext() {
    this.current = this.nextPiece
    this.nextPiece = this.randomPiece()
    this.drawNext()
    if (this.collides(this.current)) {
      this.endGame()
      return
    }
    this.setMood('thinking')
    this.checkNervousness()
  }

  checkNervousness() {
    let topRow = ROWS
    for (let r = 0; r < ROWS; r++) {
      if (this.grid[r].some((cell) => cell)) { topRow = r; break }
    }
    const height = ROWS - topRow
    if (height >= 14 && !this.gameOver) this.setMood('nervous')
  }

  lockPiece() {
    const { shape, x, y, type } = this.current
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const gy = y + r
          const gx = x + c
          if (gy >= 0) this.grid[gy][gx] = type
        }
      }
    }
    const cleared = this.clearLines()
    if (cleared > 0) {
      this.score += LINE_SCORES[cleared] * this.level
      this.lines += cleared
      const newLevel = Math.floor(this.lines / 10) + 1
      if (newLevel !== this.level) {
        this.level = newLevel
        this.dropMs = computeDropMs(this.level)
      }
      this.setMood('cheering', { animate: true })
      this.spawnFireworks(cleared)
    }
    this.spawnNext()
  }

  clearLines() {
    let count = 0
    for (let r = ROWS - 1; r >= 0; r--) {
      if (this.grid[r].every((cell) => cell)) {
        this.grid.splice(r, 1)
        this.grid.unshift(Array(COLS).fill(null))
        count++
        r++
      }
    }
    return count
  }

  endGame() {
    this.gameOver = true
    this.running = false
    this.setMood('crying', { animate: true })
    this.emit()
  }

  // ── player actions ─────────────────────────────────
  move(dx) {
    if (!this.running || this.paused || this.gameOver) return
    if (!this.collides(this.current, dx, 0)) this.current.x += dx
  }

  softDrop() {
    if (!this.running || this.paused || this.gameOver) return
    if (!this.collides(this.current, 0, 1)) {
      this.current.y += 1
      this.score += 1
      this.emit()
    } else {
      this.lockPiece()
    }
  }

  hardDrop() {
    if (!this.running || this.paused || this.gameOver) return
    let dist = 0
    while (!this.collides(this.current, 0, 1)) {
      this.current.y += 1
      dist++
    }
    this.score += dist * 2
    this.lockPiece()
  }

  rotatePiece() {
    if (!this.running || this.paused || this.gameOver) return
    if (this.current.type === 'O') return
    const rotated = this.rotate(this.current.shape)
    const kicks = [0, -1, 1, -2, 2]
    for (const k of kicks) {
      if (!this.collides(this.current, k, 0, rotated)) {
        this.current.shape = rotated
        this.current.x += k
        this.setMood('concentrating', { animate: true })
        return
      }
    }
  }

  // ── rendering ──────────────────────────────────────
  drawCell(c, x, y, color, ghost = false) {
    const px = x * CELL
    const py = y * CELL
    if (ghost) {
      c.fillStyle = 'rgba(255,255,255,0.07)'
      c.fillRect(px + 1, py + 1, CELL - 2, CELL - 2)
      c.strokeStyle = color + '88'
      c.lineWidth = 1.5
      c.strokeRect(px + 1.5, py + 1.5, CELL - 3, CELL - 3)
      return
    }
    c.fillStyle = color
    c.fillRect(px, py, CELL, CELL)
    c.fillStyle = 'rgba(255,255,255,0.25)'
    c.fillRect(px, py, CELL, 4)
    c.fillRect(px, py, 4, CELL)
    c.fillStyle = 'rgba(0,0,0,0.25)'
    c.fillRect(px + CELL - 4, py, 4, CELL)
    c.fillRect(px, py + CELL - 4, CELL, 4)
    c.strokeStyle = 'rgba(0,0,0,0.4)'
    c.lineWidth = 1
    c.strokeRect(px + 0.5, py + 0.5, CELL - 1, CELL - 1)
  }

  drawBoard() {
    const ctx = this.boardCtx
    ctx.clearRect(0, 0, this.boardW, this.boardH)
    ctx.fillStyle = '#0a0518'
    ctx.fillRect(0, 0, this.boardW, this.boardH)
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 1
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath()
      ctx.moveTo(x * CELL + 0.5, 0)
      ctx.lineTo(x * CELL + 0.5, ROWS * CELL)
      ctx.stroke()
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * CELL + 0.5)
      ctx.lineTo(COLS * CELL, y * CELL + 0.5)
      ctx.stroke()
    }
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.grid[r][c]) this.drawCell(ctx, c, r, COLORS[this.grid[r][c]])
      }
    }
    if (!this.current) return
    let ghostY = this.current.y
    while (!this.collides(this.current, 0, ghostY - this.current.y + 1)) ghostY++
    for (let r = 0; r < this.current.shape.length; r++) {
      for (let c = 0; c < this.current.shape[r].length; c++) {
        if (this.current.shape[r][c]) {
          const gy = ghostY + r
          if (gy >= 0) this.drawCell(ctx, this.current.x + c, gy, COLORS[this.current.type], true)
        }
      }
    }
    for (let r = 0; r < this.current.shape.length; r++) {
      for (let c = 0; c < this.current.shape[r].length; c++) {
        if (this.current.shape[r][c]) {
          const gy = this.current.y + r
          if (gy >= 0) this.drawCell(ctx, this.current.x + c, gy, COLORS[this.current.type])
        }
      }
    }
  }

  drawNext() {
    const ctx = this.nextCtx
    ctx.clearRect(0, 0, this.nextW, this.nextH)
    if (!this.nextPiece) return
    const s = this.nextPiece.shape
    const size = 22
    let minR = s.length, maxR = -1, minC = s[0].length, maxC = -1
    for (let r = 0; r < s.length; r++) {
      for (let c = 0; c < s[r].length; c++) {
        if (s[r][c]) {
          if (r < minR) minR = r
          if (r > maxR) maxR = r
          if (c < minC) minC = c
          if (c > maxC) maxC = c
        }
      }
    }
    const w = (maxC - minC + 1) * size
    const h = (maxR - minR + 1) * size
    const offX = (this.nextW - w) / 2
    const offY = (this.nextH - h) / 2
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (s[r][c]) {
          const px = offX + (c - minC) * size
          const py = offY + (r - minR) * size
          ctx.fillStyle = COLORS[this.nextPiece.type]
          ctx.fillRect(px, py, size, size)
          ctx.fillStyle = 'rgba(255,255,255,0.25)'
          ctx.fillRect(px, py, size, 3)
          ctx.fillRect(px, py, 3, size)
          ctx.fillStyle = 'rgba(0,0,0,0.25)'
          ctx.fillRect(px + size - 3, py, 3, size)
          ctx.fillRect(px, py + size - 3, size, 3)
          ctx.strokeStyle = 'rgba(0,0,0,0.4)'
          ctx.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1)
        }
      }
    }
  }

  // ── fireworks ──────────────────────────────────────
  spawnFireworks(intensity) {
    const bursts = 1 + intensity
    for (let i = 0; i < bursts; i++) {
      const timer = setTimeout(() => {
        const cx = 30 + Math.random() * (this.fxW - 60)
        const cy = 60 + Math.random() * (this.fxH - 200)
        const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)]
        const count = 24 + Math.floor(Math.random() * 16)
        for (let p = 0; p < count; p++) {
          const angle = (Math.PI * 2 * p) / count + Math.random() * 0.2
          const speed = 1.5 + Math.random() * 2.5
          this.particles.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            decay: 0.012 + Math.random() * 0.012,
            color,
            size: 2 + Math.random() * 2,
          })
        }
      }, i * 140)
      this.fireworkTimers.push(timer)
    }
  }

  updateFx() {
    const ctx = this.fxCtx
    ctx.clearRect(0, 0, this.fxW, this.fxH)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.06
      p.vx *= 0.99
      p.life -= p.decay
      if (p.life <= 0) {
        this.particles.splice(i, 1)
        continue
      }
      ctx.globalAlpha = Math.max(0, p.life)
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = Math.max(0, p.life * 0.3)
      ctx.beginPath()
      ctx.arc(p.x - p.vx, p.y - p.vy, p.size * 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  // ── main loop ──────────────────────────────────────
  loop(t) {
    if (!this.lastTime) this.lastTime = t
    const dt = t - this.lastTime
    this.lastTime = t
    if (this.running && !this.paused && !this.gameOver) {
      this.dropAccum += dt
      if (this.dropAccum >= this.dropMs) {
        this.dropAccum = 0
        if (!this.collides(this.current, 0, 1)) {
          this.current.y += 1
        } else {
          this.lockPiece()
        }
      }
    }
    this.drawBoard()
    this.updateFx()
    this.rafId = requestAnimationFrame(this.loop)
  }
}
