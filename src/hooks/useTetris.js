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

  return { boardRef, fxRef, nextRef, state, start, togglePause }
}
