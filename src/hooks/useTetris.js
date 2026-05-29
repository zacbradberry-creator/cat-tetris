import { useEffect, useRef, useState } from 'react'
import { TetrisEngine } from '../game/engine.js'

const DAS = 160 // delay before auto-repeat kicks in (ms)
const ARR = 50 // auto-repeat interval (ms)

const INITIAL = {
  score: 0,
  lines: 0,
  level: 1,
  running: false,
  paused: false,
  gameOver: false,
  mood: 'idle',
  bubble: 'meow',
  animSeq: 0,
  nextType: null,
}

/**
 * Bridges the imperative TetrisEngine to React: owns the canvas refs, mirrors
 * the engine's snapshots into state, and translates keyboard input (with
 * DAS/ARR auto-repeat) into engine calls.
 */
export function useTetris() {
  const boardRef = useRef(null)
  const fxRef = useRef(null)
  const nextRef = useRef(null)
  const engineRef = useRef(null)
  const [state, setState] = useState(INITIAL)

  useEffect(() => {
    if (!boardRef.current || !fxRef.current || !nextRef.current) return undefined

    const engine = new TetrisEngine({
      boardCanvas: boardRef.current,
      fxCanvas: fxRef.current,
      nextCanvas: nextRef.current,
      onState: setState,
    })
    engineRef.current = engine
    engine.mount()

    const held = new Set()
    const timers = { left: null, right: null, down: null }

    const repeat = (dir, action) => {
      action()
      clearTimeout(timers[dir])
      const tick = () => {
        if (!held.has(dir)) return
        action()
        timers[dir] = setTimeout(tick, ARR)
      }
      timers[dir] = setTimeout(tick, DAS)
    }

    const onKeyDown = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
        e.preventDefault()
      }
      if (e.repeat) return
      switch (e.key) {
        case 'ArrowLeft':
          if (held.has('left')) return
          held.add('left')
          repeat('left', () => engine.move(-1))
          break
        case 'ArrowRight':
          if (held.has('right')) return
          held.add('right')
          repeat('right', () => engine.move(1))
          break
        case 'ArrowDown':
          if (held.has('down')) return
          held.add('down')
          repeat('down', () => engine.softDrop())
          break
        case 'ArrowUp':
          engine.rotatePiece()
          break
        case ' ':
          engine.hardDrop()
          break
        case 'p':
        case 'P':
          engine.togglePause()
          break
        default:
          break
      }
    }

    const onKeyUp = (e) => {
      if (e.key === 'ArrowLeft') { held.delete('left'); clearTimeout(timers.left) }
      if (e.key === 'ArrowRight') { held.delete('right'); clearTimeout(timers.right) }
      if (e.key === 'ArrowDown') { held.delete('down'); clearTimeout(timers.down) }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      Object.values(timers).forEach(clearTimeout)
      engine.destroy()
      engineRef.current = null
    }
  }, [])

  const start = () => engineRef.current?.start()
  const togglePause = () => engineRef.current?.togglePause()

  // Actions exposed for on-screen touch buttons.
  const actions = {
    moveLeft: () => engineRef.current?.move(-1),
    moveRight: () => engineRef.current?.move(1),
    rotate: () => engineRef.current?.rotatePiece(),
    softDrop: () => engineRef.current?.softDrop(),
    hardDrop: () => engineRef.current?.hardDrop(),
  }

  // Board swipe/tap gestures: drag horizontally to move (one cell per ~26px),
  // drag down to soft-drop, quick tap to rotate. Hard drop is the DROP button.
  const gestureRef = useRef(null)
  const CELL_DRAG = 26
  const boardTouch = {
    onTouchStart: (e) => {
      if (e.target.closest('.mute-btn') || e.target.closest('.overlay')) return
      const t = e.touches[0]
      gestureRef.current = { x: t.clientX, y: t.clientY, sx: t.clientX, sy: t.clientY, st: Date.now(), moved: false }
    },
    onTouchMove: (e) => {
      const g = gestureRef.current
      if (!g) return
      const t = e.touches[0]
      let dx = t.clientX - g.x
      while (Math.abs(dx) >= CELL_DRAG) {
        if (dx > 0) { engineRef.current?.move(1); g.x += CELL_DRAG; dx -= CELL_DRAG }
        else { engineRef.current?.move(-1); g.x -= CELL_DRAG; dx += CELL_DRAG }
        g.moved = true
      }
      let dy = t.clientY - g.y
      while (dy >= CELL_DRAG) {
        engineRef.current?.softDrop()
        g.y += CELL_DRAG
        dy -= CELL_DRAG
        g.moved = true
      }
    },
    onTouchEnd: (e) => {
      const g = gestureRef.current
      gestureRef.current = null
      if (!g) return
      const ct = e.changedTouches[0]
      const tx = Math.abs((ct?.clientX ?? g.x) - g.sx)
      const ty = Math.abs((ct?.clientY ?? g.y) - g.sy)
      if (!g.moved && Date.now() - g.st < 260 && tx < 16 && ty < 16) {
        engineRef.current?.rotatePiece()
      }
    },
  }

  return { boardRef, fxRef, nextRef, state, start, togglePause, actions, boardTouch }
}
