// A little grey mouse that peeks next to the score, sniffing and twitching.
const INK = '#2a1640'

export default function Mouse() {
  return (
    <div className="mouse" aria-hidden="true">
      <svg viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg">
        {/* tail */}
        <path
          className="mouse-tail"
          d="M 14 50 q -14 4 -10 -12"
          fill="none"
          stroke="#ff86ac"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* ears */}
        <circle cx="24" cy="22" r="13" fill="#c9c9d6" stroke={INK} strokeWidth="3" />
        <circle cx="50" cy="22" r="13" fill="#c9c9d6" stroke={INK} strokeWidth="3" />
        <circle cx="24" cy="22" r="6" fill="#ff86ac" />
        <circle cx="50" cy="22" r="6" fill="#ff86ac" />
        {/* head/body */}
        <ellipse cx="37" cy="42" rx="22" ry="20" fill="#d8d8e2" stroke={INK} strokeWidth="3" />
        {/* eyes */}
        <circle cx="30" cy="40" r="3.2" fill={INK} />
        <circle cx="44" cy="40" r="3.2" fill={INK} />
        <circle cx="31" cy="39" r="1" fill="#fff" />
        <circle cx="45" cy="39" r="1" fill="#fff" />
        {/* nose + whiskers */}
        <g className="mouse-nose">
          <circle cx="37" cy="50" r="3" fill="#ff5d8f" stroke={INK} strokeWidth="1.5" />
          <g stroke={INK} strokeWidth="1.4" strokeLinecap="round">
            <line x1="34" y1="51" x2="20" y2="49" />
            <line x1="34" y1="53" x2="21" y2="55" />
            <line x1="40" y1="51" x2="54" y2="49" />
            <line x1="40" y1="53" x2="53" y2="55" />
          </g>
        </g>
      </svg>
    </div>
  )
}
