/**
 * PauseMenu.js
 * Pause menu overlay handling Resume, Restart, and return to Main Menu.
 */

export class PauseMenu {
  constructor(game) {
    this.game = game;
    this.screen = document.getElementById('pause-menu');

    document.getElementById('btn-resume')?.addEventListener('click', () => {
      this.game.resumeGame();
    });

    document.getElementById('btn-restart')?.addEventListener('click', () => {
      this.game.restartCurrentMission();
    });

    document.getElementById('btn-pause-menu')?.addEventListener('click', () => {
      this.game.returnToMainMenu();
    });
  }

  show() {
    if (this.screen) {
      this.screen.classList.remove('hidden');
      this.screen.classList.add('active');
    }
  }

  hide() {
    if (this.screen) {
      this.screen.classList.add('hidden');
      this.screen.classList.remove('active');
    }
  }
}
