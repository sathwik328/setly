/**
 * PUSHPA Audio Manager (Web Audio API Synthesizer)
 * Quiet and minimal. Single AudioContext.
 * Levels: Off (0), Low (0.25, default), Normal (0.7).
 * Strictly 3 sounds: intro whoosh, set tick, rest chime.
 */

class PushpaAudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.currentSource = null;
    this.level = 'low'; // 'off' | 'low' | 'normal'
    this.lastPlayTime = 0;
    this.minInterval = 120; // min 120ms between sounds
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.updateGain();
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }

  setLevel(newLevel) {
    if (['off', 'low', 'normal'].includes(newLevel)) {
      this.level = newLevel;
      this.updateGain();
    }
  }

  updateGain() {
    if (!this.masterGain || !this.ctx) return;
    let target = 0;
    if (this.level === 'low') target = 0.25;
    else if (this.level === 'normal') target = 0.7;
    this.masterGain.gain.setValueAtTime(target, this.ctx.currentTime);
  }

  _stopCurrent() {
    if (this.currentSource && this.ctx) {
      try {
        if (this.currentSource.gainNode) {
          this.currentSource.gainNode.gain.setValueAtTime(this.currentSource.gainNode.gain.value, this.ctx.currentTime);
          this.currentSource.gainNode.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
        }
      } catch (e) {}
      this.currentSource = null;
    }
  }

  // 1. Intro: one soft low whoosh with a gentle fade, under 1.2s, very low volume
  playIntroWhoosh() {
    if (this.level === 'off') return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return; // Stay silent if audio locked

    const now = performance.now();
    if (now - this.lastPlayTime < this.minInterval) return;
    this.lastPlayTime = now;
    this._stopCurrent();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.5);
    osc.frequency.exponentialRampToValueAtTime(45, t + 1.1);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.linearRampToValueAtTime(500, t + 0.4);
    filter.frequency.linearRampToValueAtTime(100, t + 1.1);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 1.18);
    this.currentSource = { osc, gainNode: gain };
  }

  // 2. Set complete: a soft 80ms tick
  playSetTick() {
    if (this.level === 'off') return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const now = performance.now();
    if (now - this.lastPlayTime < this.minInterval) return;
    this.lastPlayTime = now;
    this._stopCurrent();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.08);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.085);
    this.currentSource = { osc, gainNode: gain };
  }

  // 3. Rest finished: a gentle two-note chime
  playRestChime() {
    if (this.level === 'off') return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const now = performance.now();
    if (now - this.lastPlayTime < this.minInterval) return;
    this.lastPlayTime = now;
    this._stopCurrent();

    const t = this.ctx.currentTime;
    
    // Note 1: E5 (659Hz)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, t);
    gain1.gain.setValueAtTime(0.25, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(t);
    osc1.stop(t + 0.36);

    // Note 2: A5 (880Hz)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, t + 0.18);
    gain2.gain.setValueAtTime(0.001, t);
    gain2.gain.setValueAtTime(0.3, t + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(t + 0.18);
    osc2.stop(t + 0.62);

    this.currentSource = { osc: osc2, gainNode: gain2 };
  }

  // Haptic feedback (Capacitor or navigator.vibrate)
  vibrate(ms = 15) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(ms); } catch (e) {}
    }
  }
}

window.pushpaAudio = new PushpaAudioManager();
export const pushpaAudio = window.pushpaAudio;
export default pushpaAudio;
