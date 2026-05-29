// Bold, cartoony cat whose expression + effects change per mood. The shared
// head is drawn once; each mood swaps in its own eyes/mouth/extras. Effect
// elements carry `fx-*` classes that styles.css animates (streaming tears,
// flying sweat, bursting stars) so reactions read clearly during play.

const INK = '#3a2113'

function CatBase({ children }) {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="catBody" cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#fff6db" />
          <stop offset="100%" stopColor="#f3c25f" />
        </radialGradient>
      </defs>
      {/* ears */}
      <polygon points="54,46 36,8 84,40" fill="url(#catBody)" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <polygon points="146,46 164,8 116,40" fill="url(#catBody)" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <polygon points="56,42 50,20 74,38" fill="#ff9ab8" />
      <polygon points="144,42 150,20 126,38" fill="#ff9ab8" />
      {/* head */}
      <ellipse cx="100" cy="106" rx="68" ry="60" fill="url(#catBody)" stroke={INK} strokeWidth="4.5" />
      {/* cheeks */}
      <ellipse cx="52" cy="122" rx="11" ry="7" fill="#ffb3c1" opacity="0.65" />
      <ellipse cx="148" cy="122" rx="11" ry="7" fill="#ffb3c1" opacity="0.65" />
      {/* whiskers */}
      <g stroke={INK} strokeWidth="2.4" strokeLinecap="round">
        <line x1="26" y1="112" x2="58" y2="116" />
        <line x1="26" y1="124" x2="58" y2="124" />
        <line x1="174" y1="112" x2="142" y2="116" />
        <line x1="174" y1="124" x2="142" y2="124" />
      </g>
      {/* nose */}
      <polygon points="93,108 107,108 100,117" fill="#ff5d8f" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      {children}
    </svg>
  )
}

const FRAGMENTS = {
  idle: (
    <>
      <ellipse cx="74" cy="96" rx="7" ry="9" fill={INK} />
      <ellipse cx="126" cy="96" rx="7" ry="9" fill={INK} />
      <circle cx="76" cy="93" r="2.5" fill="#fff" />
      <circle cx="128" cy="93" r="2.5" fill="#fff" />
      <path d="M 88 126 Q 100 133 112 126" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),

  thinking: (
    <>
      <ellipse cx="74" cy="92" rx="7" ry="9" fill={INK} />
      <ellipse cx="126" cy="92" rx="7" ry="9" fill={INK} />
      <circle cx="78" cy="88" r="2.5" fill="#fff" />
      <circle cx="130" cy="88" r="2.5" fill="#fff" />
      <path d="M 86 128 Q 100 124 114 128" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      <text className="fx-think fx-think-1" x="150" y="52" fontSize="40" fill="#8b5cf6" fontFamily="'Luckiest Guy', cursive">?</text>
      <text className="fx-think fx-think-2" x="170" y="86" fontSize="26" fill="#c084fc" fontFamily="'Luckiest Guy', cursive">?</text>
    </>
  ),

  concentrating: (
    <>
      {/* determined furrowed brows */}
      <path d="M 60 84 L 88 92" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M 140 84 L 112 92" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="76" cy="100" rx="6" ry="7" fill={INK} />
      <ellipse cx="124" cy="100" rx="6" ry="7" fill={INK} />
      <path d="M 90 128 L 110 128" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <text className="fx-spark" x="150" y="78" fontSize="26" fill="#ffd11a" fontFamily="'Luckiest Guy', cursive">!</text>
    </>
  ),

  cheering: (
    <>
      {/* happy squinting eyes */}
      <path d="M 64 92 Q 74 80 84 92" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M 116 92 Q 126 80 136 92" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* big open smile + tongue */}
      <path d="M 76 120 Q 100 150 124 120 Q 112 138 100 138 Q 88 138 76 120 Z" fill="#7a2030" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M 90 130 Q 100 140 110 130 Q 100 134 90 130 Z" fill="#ff9ab8" />
      {/* bursting stars */}
      <g fill="#ffd11a" stroke={INK} strokeWidth="1.5">
        <polygon className="fx-star fx-star-1" points="30,46 35,60 49,62 38,71 42,86 30,77 18,86 22,71 11,62 25,60" />
        <polygon className="fx-star fx-star-2" points="170,50 174,61 186,63 177,71 180,84 170,76 160,84 163,71 154,63 166,61" />
        <polygon className="fx-star fx-star-3" points="150,150 154,160 165,162 157,169 160,181 150,174 140,181 143,169 135,162 146,160" />
      </g>
    </>
  ),

  nervous: (
    <>
      {/* wide panicked eyes */}
      <circle cx="74" cy="96" r="11" fill="#fff" stroke={INK} strokeWidth="3" />
      <circle cx="126" cy="96" r="11" fill="#fff" stroke={INK} strokeWidth="3" />
      <circle cx="74" cy="98" r="5" fill={INK} />
      <circle cx="126" cy="98" r="5" fill={INK} />
      {/* wavy worried mouth */}
      <path d="M 84 130 Q 92 122 100 130 Q 108 138 116 130" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* flying sweat drops */}
      <g className="fx-sweat fx-sweat-1">
        <path d="M 156 78 Q 150 92 160 96 Q 170 92 164 78 Q 161 70 160 66 Q 159 70 156 78 Z" fill="#6ee7ff" stroke="#2f9fc4" strokeWidth="1.5" />
      </g>
      <g className="fx-sweat fx-sweat-2">
        <path d="M 44 84 Q 38 96 47 100 Q 56 96 50 84 Q 47 77 46 74 Q 45 77 44 84 Z" fill="#6ee7ff" stroke="#2f9fc4" strokeWidth="1.5" />
      </g>
    </>
  ),

  crying: (
    <>
      {/* scrunched sad eyes */}
      <path d="M 64 98 Q 74 90 84 98" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M 116 98 Q 126 90 136 98" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* open wailing mouth */}
      <ellipse cx="100" cy="134" rx="13" ry="16" fill="#7a2030" stroke={INK} strokeWidth="3" />
      {/* streaming tears */}
      <g className="fx-tear fx-tear-1">
        <path d="M 70 104 Q 64 124 73 132 Q 82 124 76 104 Q 73 96 72 92 Q 71 96 70 104 Z" fill="#6ee7ff" stroke="#2f9fc4" strokeWidth="1.5" />
      </g>
      <g className="fx-tear fx-tear-2">
        <path d="M 130 104 Q 124 124 133 132 Q 142 124 136 104 Q 133 96 132 92 Q 131 96 130 104 Z" fill="#6ee7ff" stroke="#2f9fc4" strokeWidth="1.5" />
      </g>
    </>
  ),
}

export default function CatFace({ mood, bubble, animSeq }) {
  return (
    <div className="cat-panel">
      {/* `key` restarts the mood animation whenever the engine bumps animSeq */}
      <div className={`cat-face mood-${mood}`} key={`${mood}-${animSeq}`}>
        <CatBase>{FRAGMENTS[mood] || FRAGMENTS.idle}</CatBase>
      </div>
      <div className={`cat-bubble bubble-${mood}`}>{bubble}</div>
    </div>
  )
}
