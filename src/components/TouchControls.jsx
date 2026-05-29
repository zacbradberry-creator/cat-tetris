import { useEffect, useRef } from 'react'

const DAS = 170 // hold delay before auto-repeat (ms)
const ARR = 60 // auto-repeat interval (ms)

// A button that fires once on press and (optionally) auto-repeats while held.
// Uses pointer events so it works for touch and mouse alike.
function HoldButton({ label, ariaLabel, onAction, repeat = false, className = '' }) {
  const timer = useRef(null)

  const stop = () => {
    clearTimeout(timer.current)
    timer.current = null
  }

  useEffect(() => stop, [])

  const press = (e) => {
    e.preventDefault()
    onAction()
    if (repeat) {
      stop()
      const tick = () => {
        onAction()
        timer.current = setTimeout(tick, ARR)
      }
      timer.current = setTimeout(tick, DAS)
    }
  }

  return (
    <button
      type="button"
      className={`tc-btn ${className}`}
      aria-label={ariaLabel}
      onPointerDown={press}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  )
}

export default function TouchControls({ actions }) {
  return (
    <div className="touch-controls" role="group" aria-label="Touch controls">
      <div className="tc-row">
        <HoldButton label="◀" ariaLabel="Move left" onAction={actions.moveLeft} repeat />
        <HoldButton label="⟳" ariaLabel="Rotate" onAction={actions.rotate} />
        <HoldButton label="▶" ariaLabel="Move right" onAction={actions.moveRight} repeat />
      </div>
      <div className="tc-row">
        <HoldButton label="▼" ariaLabel="Soft drop" onAction={actions.softDrop} repeat />
        <HoldButton label="DROP" ariaLabel="Hard drop" onAction={actions.hardDrop} className="tc-wide" />
      </div>
    </div>
  )
}
