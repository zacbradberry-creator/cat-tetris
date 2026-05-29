// Stylized 80s/90s-cartoon-franchise logo: chunky outlined letters with a
// drop shadow, cat ears + whiskers, a swishing tail, and a yarn ball.
// "TETRIS" letters are colored to echo the tetromino palette.

const TETRIS = [
  { ch: 'T', fill: '#ff3b6b' },
  { ch: 'E', fill: '#ff8a1e' },
  { ch: 'T', fill: '#ffd11a' },
  { ch: 'R', fill: '#3fe04f' },
  { ch: 'I', fill: '#27d3ee' },
  { ch: 'S', fill: '#c64fff' },
]

const INK = '#2a1640'

export default function Logo() {
  return (
    <div className="logo">
      <svg viewBox="0 0 600 210" xmlns="http://www.w3.org/2000/svg" aria-label="Cat Tetris">
        {/* ── cat ears ── */}
        <g stroke={INK} strokeWidth="6" strokeLinejoin="round">
          <polygon points="232,52 214,8 268,40" fill="#ffd11a" />
          <polygon points="368,52 386,8 332,40" fill="#ffd11a" />
          <polygon points="236,46 226,22 258,40" fill="#ff86ac" stroke="none" />
          <polygon points="364,46 374,22 342,40" fill="#ff86ac" stroke="none" />
        </g>

        {/* ── swishing tail off the end of "TETRIS" ── */}
        <g className="logo-tail">
          <path
            d="M 442 178 q 64 8 70 -40 q 0 -36 -34 -36 q -22 0 -22 22 q 0 14 14 14"
            fill="none"
            stroke={INK}
            strokeWidth="22"
            strokeLinecap="round"
          />
          <path
            d="M 442 178 q 64 8 70 -40 q 0 -36 -34 -36 q -22 0 -22 22 q 0 14 14 14"
            fill="none"
            stroke="#ffd11a"
            strokeWidth="12"
            strokeLinecap="round"
          />
        </g>

        {/* ── "CAT" with drop shadow + thick outline ── */}
        <text
          x="306"
          y="112"
          textAnchor="middle"
          fontFamily="'Luckiest Guy', cursive"
          fontSize="92"
          fill={INK}
          opacity="0.55"
        >
          CAT
        </text>
        <text
          x="300"
          y="106"
          textAnchor="middle"
          fontFamily="'Luckiest Guy', cursive"
          fontSize="92"
          fill="#ffd11a"
          stroke={INK}
          strokeWidth="7"
          strokeLinejoin="round"
          paintOrder="stroke"
        >
          CAT
        </text>

        {/* whiskers flanking CAT */}
        <g stroke={INK} strokeWidth="4" strokeLinecap="round">
          <line x1="150" y1="84" x2="206" y2="80" />
          <line x1="150" y1="96" x2="206" y2="94" />
          <line x1="450" y1="84" x2="394" y2="80" />
          <line x1="450" y1="96" x2="394" y2="94" />
        </g>

        {/* ── "TETRIS" rainbow letters ── */}
        <text
          x="300"
          y="182"
          textAnchor="middle"
          fontFamily="'Luckiest Guy', cursive"
          fontSize="60"
          fill={INK}
          opacity="0.55"
        >
          {TETRIS.map((l, i) => (
            <tspan key={i}>{l.ch}</tspan>
          ))}
        </text>
        <text
          x="296"
          y="177"
          textAnchor="middle"
          fontFamily="'Luckiest Guy', cursive"
          fontSize="60"
          stroke={INK}
          strokeWidth="6"
          strokeLinejoin="round"
          paintOrder="stroke"
        >
          {TETRIS.map((l, i) => (
            <tspan key={i} fill={l.fill}>{l.ch}</tspan>
          ))}
        </text>

        {/* ── yarn ball ── */}
        <g className="logo-yarn">
          <circle cx="118" cy="150" r="26" fill="#ff5d8f" stroke={INK} strokeWidth="5" />
          <g stroke={INK} strokeWidth="2.5" fill="none" opacity="0.7">
            <path d="M 96 140 q 22 -14 42 6" />
            <path d="M 94 152 q 24 -8 46 10" />
            <path d="M 100 164 q 18 -6 36 2" />
            <path d="M 110 128 q 6 22 -2 44" />
            <path d="M 126 130 q 8 20 0 40" />
          </g>
          <path d="M 92 156 q -22 8 -30 26" fill="none" stroke="#ff5d8f" strokeWidth="4" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  )
}
