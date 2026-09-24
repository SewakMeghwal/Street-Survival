/**
 * AudioSystem.js
 * Robust audio system using Web Audio API synthesis for dog barks, growls, footsteps,
 * tension heartbeats, damage impacts, jump SFX, and ambient city sounds with 0 external dependencies.
 */

export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.masterVolume = 0.7;
    this.initialized = false;
    this.lastHeartbeat = 0;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported in this browser.', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBark(volume = 0.6) {
    if (this.muted || !this.ctx) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.16);

    gain.gain.setValueAtTime(volume * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  playGrowl(volume = 0.5) {
    if (this.muted || !this.ctx) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(50, now);
    osc.frequency.linearRampToValueAtTime(75, now + 0.45);

    gain.gain.setValueAtTime(volume * this.masterVolume * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  playHeartbeat(tension = 1.0) {
    if (this.muted || !this.ctx) return;
    const now = performance.now();
    const interval = Math.max(350, 800 - tension * 350);

    if (now - this.lastHeartbeat > interval) {
      this.lastHeartbeat = now;
      this.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const time = this.ctx.currentTime;

      osc.frequency.setValueAtTime(65, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.12);

      gain.gain.setValueAtTime(0.4 * this.masterVolume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.14);
    }
  }

  playFootstep(volume = 0.2) {
    if (this.muted || !this.ctx) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.06);

    gain.gain.setValueAtTime(volume * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  playHit(volume = 0.7) {
    if (this.muted || !this.ctx) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.28);

    gain.gain.setValueAtTime(volume * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  playVictory(volume = 0.7) {
    if (this.muted || !this.ctx) return;
    this.resume();

    const now = this.ctx.currentTime;
    [261.63, 329.63, 392.00, 523.25, 659.25].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(volume * this.masterVolume, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.4);
    });
  }
}

export const audioSystem = new AudioSystem();
