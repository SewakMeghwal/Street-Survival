/**
 * PerformanceMonitor.js
 * Lightweight performance monitor measuring FPS, frame times, and WebGL renderer info.
 */

export class PerformanceMonitor {
  constructor() {
    this.fps = 60;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.frameTime = 0;
    this.drawCalls = 0;
    this.triangles = 0;
  }

  update(renderer) {
    this.frameCount++;
    const now = performance.now();
    const delta = now - this.lastTime;

    if (delta >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / delta);
      this.frameTime = (delta / this.frameCount).toFixed(2);
      this.frameCount = 0;
      this.lastTime = now;
    }

    if (renderer && renderer.info) {
      this.drawCalls = renderer.info.render.calls;
      this.triangles = renderer.info.render.triangles;
    }
  }
}
