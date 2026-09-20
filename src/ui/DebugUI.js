/**
 * DebugUI.js
 * Developer & Debug overlay showing real-time FPS, coordinates, dog AI counts, and states.
 */

export class DebugUI {
  constructor() {
    this.overlay = document.getElementById('debug-overlay');
    this.fpsEl = document.getElementById('debug-fps');
    this.coordsEl = document.getElementById('debug-coords');
    this.dogsEl = document.getElementById('debug-dogs');
    this.missionEl = document.getElementById('debug-mission');
    this.statesEl = document.getElementById('debug-states');

    this.visible = false;
    this.initToggle();
  }

  initToggle() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyF3' || e.code === 'Backquote') {
        this.toggle();
      }
    });
  }

  toggle() {
    this.visible = !this.visible;
    if (this.overlay) {
      this.overlay.style.display = this.visible ? 'block' : 'none';
    }
  }

  update(perfMonitor, player, dogManager, activeMission) {
    if (!this.visible) return;

    if (this.fpsEl) this.fpsEl.textContent = `FPS: ${perfMonitor.fps} (${perfMonitor.frameTime}ms)`;

    if (this.coordsEl && player) {
      const p = player.position;
      this.coordsEl.textContent = `Pos: X:${p.x.toFixed(1)}, Y:${p.y.toFixed(1)}, Z:${p.z.toFixed(1)}`;
    }

    if (this.dogsEl && dogManager) {
      this.dogsEl.textContent = `Dogs Active: ${dogManager.dogs.length}`;

      if (this.statesEl) {
        const states = dogManager.dogs.map((d, i) => `#${i + 1}:${d.fsm.currentState}`).join(' | ');
        this.statesEl.textContent = `Dog States: ${states || 'None'}`;
      }
    }

    if (this.missionEl && activeMission) {
      this.missionEl.textContent = `Mission: ${activeMission.id} - ${activeMission.title}`;
    }
  }
}
