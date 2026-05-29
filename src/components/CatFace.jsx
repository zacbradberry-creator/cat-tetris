// The cat's head is identical across moods; only the eyes/mouth/extras change.
// Each mood returns the per-mood SVG fragment, composed over the shared base.

function CatBase({ children }) {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="catBody" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff5d6" />
          <stop offset="100%" stopColor="#f4c97a" />
        </radialGradient>
      </defs>
      {/* ears */}
      <polygon points="55,45 40,15 80,40" fill="url(#catBody)" stroke="#7a4d1a" strokeWidth="2" />
      <polygon points="145,45 160,15 120,40" fill="url(#catBody)" stroke="#7a4d1a" strokeWidth="2" />
      <polygon points="55,45 50,25 72,40" fill="#ff9ab8" />
      <polygon points="145,45 150,25 128,40" fill="#ff9ab8" />
      {/* head */}
      <ellipse cx="100" cy="105" rx="65" ry="58" fill="url(#catBody)" stroke="#7a4d1a" strokeWidth="2" />
      {/* cheeks */}
      <ellipse cx="55" cy="120" rx="10" ry="6" fill="#ffb3c1" opacity="0.6" />
      <ellipse cx="145" cy="120" rx="10" ry="6" fill="#ffb3c1" opacity="0.6" />
      {/* whiskers */}
      <line x1="30" y1="115" x2="60" y2="118" stroke="#7a4d1a" strokeWidth="1.5" />
      <line x1="30" y1="125" x2="60" y2="125" stroke="#7a4d1a" strokeWidth="1.5" />
      <line x1="170" y1="115" x2="140" y2="118" stroke="#7a4d1a" strokeWidth="1.5" />
      <line x1="170" y1="125" x2="140" y2="125" stroke="#7a4d1a" strokeWidth="1.5" />
      {/* nose */}
      <polygon points="95,108 105,108 100,115" fill="#ff7095" />
      {children}
    </svg>
  )
}

const FRAGMENTS = {
  idle: (
    <>
      <ellipse cx="75" cy="95" rx="6" ry="8" fill="#2a1a14" />
      <ellipse cx="125" cy="95" rx="6" ry="8" fill="#2a1a14" />
      <circle cx="77" cy="92" r="2" fill="#fff" />
      <circle cx="127" cy="92" r="2" fill="#fff" />
      <path d="M 90 125 Q 100 130 110 125" stroke="#2a1a14" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  ),
  thinking: (
    <>
      <ellipse cx="75" cy="95" rx="6" ry="8" fill="#2a1a14" />
      <ellipse cx="125" cy="95" rx="6" ry="8" fill="#2a1a14" />
      <circle cx="79" cy="93" r="2" fill="#fff" />
      <circle cx="129" cy="93" r="2" fill="#fff" />
      <path d="M 88 128 Q 100 125 112 128" stroke="#2a1a14" strokeWidth="2" fill="none" strokeLinecap="round" />
      <text x="155" y="55" fontSize="28" fill="#a78bfa" fontFamily="serif">?</text>
      <text x="170" y="80" fontSize="18" fill="#c084fc" fontFamily="serif">?</text>
    </>
  ),
  concentrating: (
    <>
      <path d="M 65 92 L 85 96" stroke="#2a1a14" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M 115 96 L 135 92" stroke="#2a1a14" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M 60 80 L 80 85" stroke="#7a4d1a" strokeWidth="2" strokeLinecap="round" />
      <path d="M 120 85 L 140 80" stroke="#7a4d1a" strokeWidth="2" strokeLinecap="round" />
      <path d="M 92 128 L 108 128" stroke="#2a1a14" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </>
  ),
  cheering: (
    <>
      <path d="M 68 90 Q 75 82 82 90" stroke="#2a1a14" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 118 90 Q 125 82 132 90" stroke="#2a1a14" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 80 122 Q 100 142 120 122 Q 110 135 100 135 Q 90 135 80 122 Z" fill="#7a2030" stroke="#2a1a14" strokeWidth="2" />
      <path d="M 88 130 Q 100 134 112 130" fill="#ff9ab8" />
      <g fill="#ffe066">
        <polygon points="25,50 28,58 36,60 28,62 25,70 22,62 14,60 22,58" />
        <polygon points="170,55 172,60 177,62 172,64 170,69 168,64 163,62 168,60" />
        <polygon points="35,150 37,155 42,157 37,159 35,164 33,159 28,157 33,155" />
      </g>
    </>
  ),
  nervous: (
    <>
      <ellipse cx="75" cy="95" rx="7" ry="9" fill="#2a1a14" />
      <ellipse cx="125" cy="95" rx="7" ry="9" fill="#2a1a14" />
      <circle cx="75" cy="92" r="3" fill="#fff" />
      <circle cx="125" cy="92" r="3" fill="#fff" />
      <path d="M 85 128 Q 100 120 115 128" stroke="#2a1a14" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 155 75 Q 150 90 160 92 Q 170 90 165 75 Q 162 68 160 65 Q 158 68 155 75 Z" fill="#6ee7ff" stroke="#3aa8d4" strokeWidth="1.5" />
      <ellipse cx="158" cy="82" rx="2" ry="3" fill="#fff" opacity="0.7" />
    </>
  ),
  crying: (
    <>
      <path d="M 68 98 Q 75 92 82 98" stroke="#2a1a14" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 118 98 Q 125 92 132 98" stroke="#2a1a14" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 90 130 Q 100 122 110 130" stroke="#2a1a14" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M 70 105 Q 65 125 72 140 Q 78 130 75 110 Z" fill="#6ee7ff" stroke="#3aa8d4" strokeWidth="1.5" />
      <path d="M 130 105 Q 135 125 128 140 Q 122 130 125 110 Z" fill="#6ee7ff" stroke="#3aa8d4" strokeWidth="1.5" />
    </>
  ),
}

const ANIM = {
  cheering: 'bounce',
  concentrating: 'shake',
  crying: 'shake',
}

export default function CatFace({ mood, bubble, animSeq }) {
  const animClass = ANIM[mood] || ''
  return (
    <div className="cat-panel">
      {/* `key` forces a remount on each animSeq bump so the CSS animation restarts */}
      <div className={`cat-face ${animClass}`} key={`${mood}-${animSeq}`}>
        <CatBase>{FRAGMENTS[mood] || FRAGMENTS.idle}</CatBase>
      </div>
      <div className="cat-bubble">{bubble}</div>
    </div>
  )
}
