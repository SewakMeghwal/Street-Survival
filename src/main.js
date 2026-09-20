import { Game } from './game/Game.js';

/**
 * main.js
 * Application entry point booting Street Survival WebGL Engine.
 */

window.addEventListener('DOMContentLoaded', () => {
  try {
    const game = new Game();
    window.game = game; // Exposed for debug console inspection
  } catch (err) {
    console.error('Failed to initialize Street Survival Game:', err);
    const errOverlay = document.getElementById('webgl-error');
    if (errOverlay) errOverlay.style.display = 'flex';
  }
});
