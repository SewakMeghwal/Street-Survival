/**
 * GameLoop.js
 * High-performance RAF update loop with fixed delta time clamping.
 */

export class GameLoop {
  constructor(updateFn, renderFn) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;

    this.lastTime = 0;
    this.running = false;
    this.rafId = null;

    this.tick = this.tick.bind(this);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  tick(now) {
    if (!this.running) return;

    let delta = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Clamp delta to prevent physics explosion if tab was backgrounded
    if (delta > 0.1) delta = 0.1;

    this.updateFn(delta);
    this.renderFn(delta);

    this.rafId = requestAnimationFrame(this.tick);
  }
}
