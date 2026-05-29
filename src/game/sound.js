// Procedural cat-meow synthesis via the Web Audio API — no audio files needed.
//
// A meow is modelled as a glottal source (a buzzy oscillator with a pitch
// glide) shaped by a bank of three band-pass "formant" filters that sweep
// through vowel positions ee → ah → oo, which is what gives the "mee-ow"
// character. Each emotion is a different recipe (pitch contour, vibrato,
// vowel path) or a short sequence of meows.

// Formant frequencies (Hz) for a few vowels: [F1, F2, F3].
const VOWELS = {
  ee: [320, 2300, 3000],
  ah: [700, 1200, 2600],
  oo: [320, 800, 2400],
}

let ctx = null
let master = null

function ensureCtx() {
  if (ctx) return ctx
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = 0.32
  master.connect(ctx.destination)
  return ctx
}

/**
 * Play a single meow.
 * @param {number} t0 absolute start time (ctx.currentTime based)
 * @param {object} o  shaping parameters
 */
function meow(t0, o) {
  const {
    dur = 0.5,
    f0 = 460, // onset pitch
    fPeak = 620, // pitch high point
    fEnd = 380, // pitch at release
    peakAt = 0.25, // where the pitch peaks (fraction of dur)
    vibratoRate = 6,
    vibratoDepth = 12, // Hz
    gain = 0.6,
    type = 'sawtooth',
    vowels = ['ee', 'ah', 'oo'],
    detune = 0,
  } = o

  const end = t0 + dur

  // Glottal source with a pitch glide.
  const osc = ctx.createOscillator()
  osc.type = type
  osc.detune.value = detune
  osc.frequency.setValueAtTime(f0, t0)
  osc.frequency.linearRampToValueAtTime(fPeak, t0 + dur * peakAt)
  osc.frequency.exponentialRampToValueAtTime(Math.max(fEnd, 1), end)

  // Vibrato.
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = vibratoRate
  lfoGain.gain.value = vibratoDepth
  lfo.connect(lfoGain).connect(osc.frequency)

  // Amplitude envelope (quick attack, soft release).
  const amp = ctx.createGain()
  amp.gain.setValueAtTime(0.0001, t0)
  amp.gain.linearRampToValueAtTime(gain, t0 + 0.02)
  amp.gain.setValueAtTime(gain, t0 + dur * 0.7)
  amp.gain.exponentialRampToValueAtTime(0.0001, end)

  // Three parallel band-pass formants that morph ee → ah → oo across the meow.
  const sum = ctx.createGain()
  const v0 = VOWELS[vowels[0]]
  const v1 = VOWELS[vowels[1] || vowels[0]]
  const v2 = VOWELS[vowels[2] || vowels[1] || vowels[0]]
  const formantGain = [1, 0.7, 0.4]
  for (let i = 0; i < 3; i++) {
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 8
    bp.frequency.setValueAtTime(v0[i], t0)
    bp.frequency.linearRampToValueAtTime(v1[i], t0 + dur * 0.45)
    bp.frequency.linearRampToValueAtTime(v2[i], end)
    const g = ctx.createGain()
    g.gain.value = formantGain[i]
    osc.connect(bp).connect(g).connect(sum)
  }
  sum.connect(amp).connect(master)

  osc.start(t0)
  lfo.start(t0)
  osc.stop(end + 0.05)
  lfo.stop(end + 0.05)
}

// Per-emotion recipes. Each returns nothing; it just schedules meows.
const VOICES = {
  // Friendly greeting when a game starts.
  idle() {
    const t = ctx.currentTime
    meow(t, { dur: 0.5, f0: 480, fPeak: 600, fEnd: 360, peakAt: 0.3, vibratoRate: 5, vibratoDepth: 10, gain: 0.5 })
  },

  // Curious "mrrp?" on a new piece — short, with an upward (questioning) lilt.
  thinking() {
    const t = ctx.currentTime
    meow(t, { dur: 0.3, f0: 420, fPeak: 470, fEnd: 650, peakAt: 0.4, vibratoRate: 6, vibratoDepth: 8, gain: 0.42, vowels: ['ee', 'ah'] })
  },

  // Tiny focused chirp on rotation (throttled by the caller).
  concentrating() {
    const t = ctx.currentTime
    meow(t, { dur: 0.11, f0: 360, fPeak: 410, fEnd: 340, peakAt: 0.3, vibratoRate: 0, vibratoDepth: 0, gain: 0.3, vowels: ['ah'] })
  },

  // Sing-songy, melodic celebration on a line clear: a lilting little tune.
  cheering() {
    const t = ctx.currentTime
    const notes = [523, 659, 784, 659, 880] // C5 E5 G5 E5 A5
    const offsets = [0, 0.15, 0.3, 0.44, 0.58]
    notes.forEach((n, i) => {
      meow(t + offsets[i], {
        dur: 0.24,
        f0: n * 0.9,
        fPeak: n * 1.12,
        fEnd: n,
        peakAt: 0.35,
        vibratoRate: 7,
        vibratoDepth: 14,
        gain: 0.5,
        vowels: ['ee', 'ah', 'oo'],
      })
    })
  },

  // Frantic, worried meows when the stack is dangerously high: rapid, high,
  // wavering, each a little more strained than the last.
  nervous() {
    const t = ctx.currentTime
    const count = 4
    for (let i = 0; i < count; i++) {
      meow(t + i * 0.16, {
        dur: 0.14,
        f0: 720 + i * 40,
        fPeak: 880 + i * 50,
        fEnd: 700 + i * 40,
        peakAt: 0.4,
        vibratoRate: 15,
        vibratoDepth: 28,
        gain: 0.46,
        vowels: ['ah', 'ah'],
        detune: i % 2 ? 18 : -18,
      })
    }
  },

  // Drawn-out, drooping sad wail on game over.
  crying() {
    const t = ctx.currentTime
    meow(t, {
      dur: 1.3,
      f0: 560,
      fPeak: 600,
      fEnd: 230,
      peakAt: 0.12,
      vibratoRate: 4,
      vibratoDepth: 18,
      gain: 0.5,
      vowels: ['ee', 'ah', 'oo'],
    })
  },
}

let lastConcentrate = 0

export const sound = {
  // Create/resume the context — must be triggered from a user gesture.
  resume() {
    const c = ensureCtx()
    if (c && c.state === 'suspended') c.resume()
  },

  play(emotion) {
    const c = ensureCtx()
    if (!c) return
    if (c.state === 'suspended') c.resume()
    // Throttle the rotation chirp so rapid spins don't pile up.
    if (emotion === 'concentrating') {
      if (c.currentTime - lastConcentrate < 0.09) return
      lastConcentrate = c.currentTime
    }
    const voice = VOICES[emotion]
    if (voice) {
      try { voice() } catch { /* ignore audio scheduling errors */ }
    }
  },
}
