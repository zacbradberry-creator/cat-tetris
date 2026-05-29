(() => {
  const COLS = 10;
  const ROWS = 20;
  const CELL = 30;

  const board = document.getElementById('board');
  const ctx = board.getContext('2d');
  const fx = document.getElementById('fx');
  const fxCtx = fx.getContext('2d');
  const nextCanvas = document.getElementById('next');
  const nextCtx = nextCanvas.getContext('2d');

  const scoreEl = document.getElementById('score');
  const levelEl = document.getElementById('level');
  const linesEl = document.getElementById('lines');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlaySub = document.getElementById('overlaySub');
  const startBtn = document.getElementById('startBtn');
  const catFaceEl = document.getElementById('catFace');
  const catBubbleEl = document.getElementById('catBubble');

  const COLORS = {
    I: '#6ee7ff',
    O: '#ffd966',
    T: '#c084fc',
    S: '#7ee787',
    Z: '#ff8aa8',
    J: '#7aa8ff',
    L: '#ffb172',
  };

  const SHAPES = {
    I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1],[0,0,0]],
    S: [[0,1,1],[1,1,0],[0,0,0]],
    Z: [[1,1,0],[0,1,1],[0,0,0]],
    J: [[1,0,0],[1,1,1],[0,0,0]],
    L: [[0,0,1],[1,1,1],[0,0,0]],
  };

  const KEYS = Object.keys(SHAPES);

  let grid, current, nextPiece, score, lines, level, dropMs, dropAccum, running, paused, gameOver, lastTime;
  let particles = [];

  // ───────────────────────────────────────────────────
  // Cat faces (SVG strings)
  // ───────────────────────────────────────────────────
  const CAT_BASE = (extras) => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="catBody" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#fff5d6"/>
          <stop offset="100%" stop-color="#f4c97a"/>
        </radialGradient>
      </defs>
      <!-- ears -->
      <polygon points="55,45 40,15 80,40" fill="url(#catBody)" stroke="#7a4d1a" stroke-width="2"/>
      <polygon points="145,45 160,15 120,40" fill="url(#catBody)" stroke="#7a4d1a" stroke-width="2"/>
      <polygon points="55,45 50,25 72,40" fill="#ff9ab8"/>
      <polygon points="145,45 150,25 128,40" fill="#ff9ab8"/>
      <!-- head -->
      <ellipse cx="100" cy="105" rx="65" ry="58" fill="url(#catBody)" stroke="#7a4d1a" stroke-width="2"/>
      <!-- cheeks -->
      <ellipse cx="55" cy="120" rx="10" ry="6" fill="#ffb3c1" opacity="0.6"/>
      <ellipse cx="145" cy="120" rx="10" ry="6" fill="#ffb3c1" opacity="0.6"/>
      <!-- whiskers -->
      <line x1="30" y1="115" x2="60" y2="118" stroke="#7a4d1a" stroke-width="1.5"/>
      <line x1="30" y1="125" x2="60" y2="125" stroke="#7a4d1a" stroke-width="1.5"/>
      <line x1="170" y1="115" x2="140" y2="118" stroke="#7a4d1a" stroke-width="1.5"/>
      <line x1="170" y1="125" x2="140" y2="125" stroke="#7a4d1a" stroke-width="1.5"/>
      <!-- nose -->
      <polygon points="95,108 105,108 100,115" fill="#ff7095"/>
      ${extras}
    </svg>
  `;

  const FACES = {
    idle: CAT_BASE(`
      <ellipse cx="75" cy="95" rx="6" ry="8" fill="#2a1a14"/>
      <ellipse cx="125" cy="95" rx="6" ry="8" fill="#2a1a14"/>
      <circle cx="77" cy="92" r="2" fill="#fff"/>
      <circle cx="127" cy="92" r="2" fill="#fff"/>
      <path d="M 90 125 Q 100 130 110 125" stroke="#2a1a14" stroke-width="2" fill="none" stroke-linecap="round"/>
    `),
    thinking: CAT_BASE(`
      <ellipse cx="75" cy="95" rx="6" ry="8" fill="#2a1a14"/>
      <ellipse cx="125" cy="95" rx="6" ry="8" fill="#2a1a14"/>
      <circle cx="79" cy="93" r="2" fill="#fff"/>
      <circle cx="129" cy="93" r="2" fill="#fff"/>
      <path d="M 88 128 Q 100 125 112 128" stroke="#2a1a14" stroke-width="2" fill="none" stroke-linecap="round"/>
      <text x="155" y="55" font-size="28" fill="#a78bfa" font-family="serif">?</text>
      <text x="170" y="80" font-size="18" fill="#c084fc" font-family="serif">?</text>
    `),
    concentrating: CAT_BASE(`
      <path d="M 65 92 L 85 96" stroke="#2a1a14" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M 115 96 L 135 92" stroke="#2a1a14" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M 60 80 L 80 85" stroke="#7a4d1a" stroke-width="2" stroke-linecap="round"/>
      <path d="M 120 85 L 140 80" stroke="#7a4d1a" stroke-width="2" stroke-linecap="round"/>
      <path d="M 92 128 L 108 128" stroke="#2a1a14" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    `),
    cheering: CAT_BASE(`
      <path d="M 68 90 Q 75 82 82 90" stroke="#2a1a14" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M 118 90 Q 125 82 132 90" stroke="#2a1a14" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M 80 122 Q 100 142 120 122 Q 110 135 100 135 Q 90 135 80 122 Z" fill="#7a2030" stroke="#2a1a14" stroke-width="2"/>
      <path d="M 88 130 Q 100 134 112 130" fill="#ff9ab8"/>
      <!-- sparkles -->
      <g fill="#ffe066">
        <polygon points="25,50 28,58 36,60 28,62 25,70 22,62 14,60 22,58"/>
        <polygon points="170,55 172,60 177,62 172,64 170,69 168,64 163,62 168,60"/>
        <polygon points="35,150 37,155 42,157 37,159 35,164 33,159 28,157 33,155"/>
      </g>
    `),
    nervous: CAT_BASE(`
      <ellipse cx="75" cy="95" rx="7" ry="9" fill="#2a1a14"/>
      <ellipse cx="125" cy="95" rx="7" ry="9" fill="#2a1a14"/>
      <circle cx="75" cy="92" r="3" fill="#fff"/>
      <circle cx="125" cy="92" r="3" fill="#fff"/>
      <path d="M 85 128 Q 100 120 115 128" stroke="#2a1a14" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- sweat drop -->
      <path d="M 155 75 Q 150 90 160 92 Q 170 90 165 75 Q 162 68 160 65 Q 158 68 155 75 Z" fill="#6ee7ff" stroke="#3aa8d4" stroke-width="1.5"/>
      <ellipse cx="158" cy="82" rx="2" ry="3" fill="#fff" opacity="0.7"/>
    `),
    crying: CAT_BASE(`
      <path d="M 68 98 Q 75 92 82 98" stroke="#2a1a14" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M 118 98 Q 125 92 132 98" stroke="#2a1a14" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M 90 130 Q 100 122 110 130" stroke="#2a1a14" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- tears -->
      <path d="M 70 105 Q 65 125 72 140 Q 78 130 75 110 Z" fill="#6ee7ff" stroke="#3aa8d4" stroke-width="1.5"/>
      <path d="M 130 105 Q 135 125 128 140 Q 122 130 125 110 Z" fill="#6ee7ff" stroke="#3aa8d4" stroke-width="1.5"/>
    `),
  };

  const BUBBLES = {
    idle: 'meow',
    thinking: 'hmm…',
    concentrating: 'focus!',
    cheering: 'yaaay!',
    nervous: 'eek…',
    crying: 'nooo…',
  };

  let currentMood = null;
  let moodLockUntil = 0;

  function setMood(mood, lockMs = 0, animClass = '') {
    const now = performance.now();
    if (now < moodLockUntil && mood !== 'crying') return;
    if (mood === currentMood && !animClass) return;
    currentMood = mood;
    catFaceEl.innerHTML = FACES[mood];
    catBubbleEl.textContent = BUBBLES[mood];
    if (animClass) {
      catFaceEl.classList.remove('bounce', 'shake');
      // force reflow to restart animation
      void catFaceEl.offsetWidth;
      catFaceEl.classList.add(animClass);
    }
    moodLockUntil = now + lockMs;
  }

  // ───────────────────────────────────────────────────
  // Game state
  // ───────────────────────────────────────────────────
  function makeGrid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  function randomPiece() {
    const type = KEYS[Math.floor(Math.random() * KEYS.length)];
    const shape = SHAPES[type].map((row) => row.slice());
    return {
      type,
      shape,
      x: Math.floor((COLS - shape[0].length) / 2),
      y: type === 'I' ? -1 : 0,
    };
  }

  function rotate(matrix) {
    const n = matrix.length;
    const result = Array.from({ length: n }, () => Array(n).fill(0));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        result[c][n - 1 - r] = matrix[r][c];
      }
    }
    return result;
  }

  function collides(piece, dx = 0, dy = 0, shape = piece.shape) {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const nx = piece.x + c + dx;
        const ny = piece.y + r + dy;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
        if (ny >= 0 && grid[ny][nx]) return true;
      }
    }
    return false;
  }

  function lockPiece() {
    const { shape, x, y, type } = current;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const gy = y + r;
          const gx = x + c;
          if (gy >= 0) grid[gy][gx] = type;
        }
      }
    }
    const cleared = clearLines();
    if (cleared > 0) {
      score += [0, 100, 300, 500, 800][cleared] * level;
      lines += cleared;
      const newLevel = Math.floor(lines / 10) + 1;
      if (newLevel !== level) {
        level = newLevel;
        dropMs = computeDropMs(level);
      }
      updateHUD();
      setMood('cheering', 700, 'bounce');
      spawnFireworks(cleared);
    }
    spawnNext();
  }

  function spawnNext() {
    current = nextPiece;
    nextPiece = randomPiece();
    drawNext();
    if (collides(current)) {
      endGame();
      return;
    }
    setMood('thinking', 350);
    checkNervousness();
  }

  function checkNervousness() {
    // find highest filled row
    let topRow = ROWS;
    for (let r = 0; r < ROWS; r++) {
      if (grid[r].some((cell) => cell)) { topRow = r; break; }
    }
    const height = ROWS - topRow;
    if (height >= 14 && !gameOver) {
      setMood('nervous', 600);
    }
  }

  function clearLines() {
    let count = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (grid[r].every((cell) => cell)) {
        grid.splice(r, 1);
        grid.unshift(Array(COLS).fill(null));
        count++;
        r++;
      }
    }
    return count;
  }

  function computeDropMs(lvl) {
    return Math.max(80, 800 - (lvl - 1) * 70);
  }

  function move(dx) {
    if (!running || paused || gameOver) return;
    if (!collides(current, dx, 0)) current.x += dx;
  }

  function softDrop() {
    if (!running || paused || gameOver) return;
    if (!collides(current, 0, 1)) {
      current.y += 1;
      score += 1;
      updateHUD();
    } else {
      lockPiece();
    }
  }

  function hardDrop() {
    if (!running || paused || gameOver) return;
    let dist = 0;
    while (!collides(current, 0, 1)) {
      current.y += 1;
      dist++;
    }
    score += dist * 2;
    updateHUD();
    lockPiece();
  }

  function rotatePiece() {
    if (!running || paused || gameOver) return;
    if (current.type === 'O') return;
    const rotated = rotate(current.shape);
    // simple wall-kick attempts
    const kicks = [0, -1, 1, -2, 2];
    for (const k of kicks) {
      if (!collides(current, k, 0, rotated)) {
        current.shape = rotated;
        current.x += k;
        setMood('concentrating', 250, 'shake');
        return;
      }
    }
  }

  function endGame() {
    gameOver = true;
    running = false;
    setMood('crying', 9999);
    overlayTitle.textContent = 'Game Over';
    overlaySub.innerHTML = `Final score: <strong>${score}</strong><br/>Lines: ${lines} · Level reached: ${level}`;
    startBtn.textContent = 'Play again';
    overlay.classList.remove('hidden');
  }

  function updateHUD() {
    scoreEl.textContent = score;
    levelEl.textContent = level;
    linesEl.textContent = lines;
  }

  // ───────────────────────────────────────────────────
  // Rendering
  // ───────────────────────────────────────────────────
  function drawCell(c, x, y, color, ghost = false) {
    const px = x * CELL;
    const py = y * CELL;
    if (ghost) {
      c.fillStyle = 'rgba(255,255,255,0.07)';
      c.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
      c.strokeStyle = color + '88';
      c.lineWidth = 1.5;
      c.strokeRect(px + 1.5, py + 1.5, CELL - 3, CELL - 3);
      return;
    }
    // base
    c.fillStyle = color;
    c.fillRect(px, py, CELL, CELL);
    // highlight
    c.fillStyle = 'rgba(255,255,255,0.25)';
    c.fillRect(px, py, CELL, 4);
    c.fillRect(px, py, 4, CELL);
    // shadow
    c.fillStyle = 'rgba(0,0,0,0.25)';
    c.fillRect(px + CELL - 4, py, 4, CELL);
    c.fillRect(px, py + CELL - 4, CELL, 4);
    // border
    c.strokeStyle = 'rgba(0,0,0,0.4)';
    c.lineWidth = 1;
    c.strokeRect(px + 0.5, py + 0.5, CELL - 1, CELL - 1);
  }

  function drawBoard() {
    ctx.clearRect(0, 0, board.width, board.height);
    // background grid
    ctx.fillStyle = '#0a0518';
    ctx.fillRect(0, 0, board.width, board.height);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL + 0.5, 0);
      ctx.lineTo(x * CELL + 0.5, ROWS * CELL);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL + 0.5);
      ctx.lineTo(COLS * CELL, y * CELL + 0.5);
      ctx.stroke();
    }
    // locked cells
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c]) drawCell(ctx, c, r, COLORS[grid[r][c]]);
      }
    }
    if (!current) return;
    // ghost piece
    let ghostY = current.y;
    while (!collides(current, 0, ghostY - current.y + 1)) ghostY++;
    for (let r = 0; r < current.shape.length; r++) {
      for (let c = 0; c < current.shape[r].length; c++) {
        if (current.shape[r][c]) {
          const gy = ghostY + r;
          if (gy >= 0) drawCell(ctx, current.x + c, gy, COLORS[current.type], true);
        }
      }
    }
    // current piece
    for (let r = 0; r < current.shape.length; r++) {
      for (let c = 0; c < current.shape[r].length; c++) {
        if (current.shape[r][c]) {
          const gy = current.y + r;
          if (gy >= 0) drawCell(ctx, current.x + c, gy, COLORS[current.type]);
        }
      }
    }
  }

  function drawNext() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (!nextPiece) return;
    const s = nextPiece.shape;
    const size = 22;
    // trim empty rows/cols for centering
    let minR = s.length, maxR = -1, minC = s[0].length, maxC = -1;
    for (let r = 0; r < s.length; r++) {
      for (let c = 0; c < s[r].length; c++) {
        if (s[r][c]) {
          if (r < minR) minR = r;
          if (r > maxR) maxR = r;
          if (c < minC) minC = c;
          if (c > maxC) maxC = c;
        }
      }
    }
    const w = (maxC - minC + 1) * size;
    const h = (maxR - minR + 1) * size;
    const offX = (nextCanvas.width - w) / 2;
    const offY = (nextCanvas.height - h) / 2;
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (s[r][c]) {
          const px = offX + (c - minC) * size;
          const py = offY + (r - minR) * size;
          nextCtx.fillStyle = COLORS[nextPiece.type];
          nextCtx.fillRect(px, py, size, size);
          nextCtx.fillStyle = 'rgba(255,255,255,0.25)';
          nextCtx.fillRect(px, py, size, 3);
          nextCtx.fillRect(px, py, 3, size);
          nextCtx.fillStyle = 'rgba(0,0,0,0.25)';
          nextCtx.fillRect(px + size - 3, py, 3, size);
          nextCtx.fillRect(px, py + size - 3, size, 3);
          nextCtx.strokeStyle = 'rgba(0,0,0,0.4)';
          nextCtx.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1);
        }
      }
    }
  }

  // ───────────────────────────────────────────────────
  // Fireworks
  // ───────────────────────────────────────────────────
  const FIREWORK_COLORS = ['#ffd966', '#ff8aa8', '#6ee7ff', '#c084fc', '#7ee787', '#ffb172'];

  function spawnFireworks(intensity) {
    const bursts = 1 + intensity;
    for (let i = 0; i < bursts; i++) {
      setTimeout(() => {
        const cx = 30 + Math.random() * (board.width - 60);
        const cy = 60 + Math.random() * (board.height - 200);
        const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
        const count = 24 + Math.floor(Math.random() * 16);
        for (let p = 0; p < count; p++) {
          const angle = (Math.PI * 2 * p) / count + Math.random() * 0.2;
          const speed = 1.5 + Math.random() * 2.5;
          particles.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            decay: 0.012 + Math.random() * 0.012,
            color,
            size: 2 + Math.random() * 2,
          });
        }
      }, i * 140);
    }
  }

  function updateFx(dt) {
    fxCtx.clearRect(0, 0, fx.width, fx.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06;
      p.vx *= 0.99;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      fxCtx.globalAlpha = Math.max(0, p.life);
      fxCtx.fillStyle = p.color;
      fxCtx.beginPath();
      fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      fxCtx.fill();
      // trail
      fxCtx.globalAlpha = Math.max(0, p.life * 0.3);
      fxCtx.beginPath();
      fxCtx.arc(p.x - p.vx, p.y - p.vy, p.size * 1.5, 0, Math.PI * 2);
      fxCtx.fill();
    }
    fxCtx.globalAlpha = 1;
  }

  // ───────────────────────────────────────────────────
  // Loop & controls
  // ───────────────────────────────────────────────────
  function loop(t) {
    if (!lastTime) lastTime = t;
    const dt = t - lastTime;
    lastTime = t;
    if (running && !paused && !gameOver) {
      dropAccum += dt;
      if (dropAccum >= dropMs) {
        dropAccum = 0;
        if (!collides(current, 0, 1)) {
          current.y += 1;
        } else {
          lockPiece();
        }
      }
    }
    drawBoard();
    updateFx(dt);
    requestAnimationFrame(loop);
  }

  function start() {
    grid = makeGrid();
    score = 0;
    lines = 0;
    level = 1;
    dropMs = computeDropMs(level);
    dropAccum = 0;
    running = true;
    paused = false;
    gameOver = false;
    particles = [];
    moodLockUntil = 0;
    currentMood = null;
    nextPiece = randomPiece();
    spawnNext();
    updateHUD();
    overlay.classList.add('hidden');
  }

  function togglePause() {
    if (gameOver || !running) return;
    paused = !paused;
    if (paused) {
      overlayTitle.textContent = 'Paused';
      overlaySub.textContent = 'Press P to resume';
      startBtn.textContent = 'Resume';
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  }

  // ───────────────────────────────────────────────────
  // Input
  // ───────────────────────────────────────────────────
  const heldKeys = new Set();
  let leftRepeat = null, rightRepeat = null, downRepeat = null;
  const DAS = 160, ARR = 50;

  function startRepeat(dir) {
    if (dir === 'left') {
      move(-1);
      clearTimeout(leftRepeat);
      leftRepeat = setTimeout(function tick() {
        if (heldKeys.has('ArrowLeft')) {
          move(-1);
          leftRepeat = setTimeout(tick, ARR);
        }
      }, DAS);
    } else if (dir === 'right') {
      move(1);
      clearTimeout(rightRepeat);
      rightRepeat = setTimeout(function tick() {
        if (heldKeys.has('ArrowRight')) {
          move(1);
          rightRepeat = setTimeout(tick, ARR);
        }
      }, DAS);
    } else if (dir === 'down') {
      softDrop();
      clearTimeout(downRepeat);
      downRepeat = setTimeout(function tick() {
        if (heldKeys.has('ArrowDown')) {
          softDrop();
          downRepeat = setTimeout(tick, ARR);
        }
      }, DAS);
    }
  }

  document.addEventListener('keydown', (e) => {
    if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '].includes(e.key)) e.preventDefault();
    if (e.repeat) return;
    if (heldKeys.has(e.key)) return;
    heldKeys.add(e.key);
    switch (e.key) {
      case 'ArrowLeft': startRepeat('left'); break;
      case 'ArrowRight': startRepeat('right'); break;
      case 'ArrowDown': startRepeat('down'); break;
      case 'ArrowUp': rotatePiece(); break;
      case ' ': hardDrop(); break;
      case 'p': case 'P': togglePause(); break;
    }
  });

  document.addEventListener('keyup', (e) => {
    heldKeys.delete(e.key);
    if (e.key === 'ArrowLeft') clearTimeout(leftRepeat);
    if (e.key === 'ArrowRight') clearTimeout(rightRepeat);
    if (e.key === 'ArrowDown') clearTimeout(downRepeat);
  });

  startBtn.addEventListener('click', () => {
    if (paused) {
      togglePause();
    } else {
      start();
    }
  });

  // initial render
  grid = makeGrid();
  setMood('idle');
  drawBoard();
  requestAnimationFrame(loop);
})();
