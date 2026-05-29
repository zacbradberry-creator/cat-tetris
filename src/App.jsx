import { useState } from 'react'
import { useTetris } from './hooks/useTetris.js'
import CatFace from './components/CatFace.jsx'
import { sound } from './game/sound.js'
import { COLS, ROWS, CELL } from './game/constants.js'

function MuteButton() {
  const [muted, setMuted] = useState(() => sound.isMuted())
  return (
    <button
      type="button"
      className="mute-btn"
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      title={muted ? 'Unmute' : 'Mute'}
      aria-pressed={muted}
      onClick={() => setMuted(sound.toggleMuted())}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}

function NextPreview({ nextRef }) {
  return (
    <div className="info-block">
      <div className="info-label">Next</div>
      <canvas id="next" ref={nextRef} width={120} height={120} />
    </div>
  )
}

function Overlay({ state, start, togglePause }) {
  const { running, paused, gameOver, score, lines, level } = state
  const visible = !running || paused || gameOver
  if (!visible) return null

  let title = 'Cat Tetris'
  let sub = (
    <>Arrow keys to move · ↑ rotate · Space hard drop · P pause</>
  )
  let buttonLabel = 'Start'
  let onClick = start

  if (gameOver) {
    title = 'Game Over'
    sub = (
      <>
        Final score: <strong>{score}</strong>
        <br />
        Lines: {lines} · Level reached: {level}
      </>
    )
    buttonLabel = 'Play again'
  } else if (paused) {
    title = 'Paused'
    sub = <>Press P to resume</>
    buttonLabel = 'Resume'
    onClick = togglePause
  }

  return (
    <div className="overlay">
      <div className="overlay-card">
        <h1>{title}</h1>
        <p>{sub}</p>
        <button id="startBtn" onClick={onClick}>{buttonLabel}</button>
      </div>
    </div>
  )
}

export default function App() {
  const { boardRef, fxRef, nextRef, state, start, togglePause } = useTetris()

  return (
    <div className="game-container">
      <aside className="sidebar left">
        <CatFace mood={state.mood} bubble={state.bubble} animSeq={state.animSeq} />
      </aside>

      <main className="board-wrap">
        <canvas id="board" ref={boardRef} width={COLS * CELL} height={ROWS * CELL} />
        <canvas id="fx" ref={fxRef} width={COLS * CELL} height={ROWS * CELL} />
        <MuteButton />
        <Overlay state={state} start={start} togglePause={togglePause} />
      </main>

      <aside className="sidebar right">
        <div className="info">
          <div className="info-block">
            <div className="info-label">Score</div>
            <div className="info-value">{state.score}</div>
          </div>
          <div className="info-block">
            <div className="info-label">Level</div>
            <div className="info-value">{state.level}</div>
          </div>
          <div className="info-block">
            <div className="info-label">Lines</div>
            <div className="info-value">{state.lines}</div>
          </div>
          <NextPreview nextRef={nextRef} />
        </div>
      </aside>
    </div>
  )
}
