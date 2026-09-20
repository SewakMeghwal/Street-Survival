/**
 * GameOverUI.js
 * Game Over defeat & Mission Victory summary screens.
 */

export class GameOverUI {
  constructor(game) {
    this.game = game;
    this.gameoverScreen = document.getElementById('gameover-menu');
    this.victoryScreen = document.getElementById('victory-menu');

    document.getElementById('btn-retry')?.addEventListener('click', () => {
      this.game.restartCurrentMission();
    });

    document.getElementById('btn-gameover-menu')?.addEventListener('click', () => {
      this.game.returnToMainMenu();
    });

    document.getElementById('btn-next-mission')?.addEventListener('click', () => {
      this.game.startNextMission();
    });

    document.getElementById('btn-victory-menu')?.addEventListener('click', () => {
      this.game.returnToMainMenu();
    });
  }

  showGameOver(reason = 'The stray dog pack overwhelmed you.') {
    const reasonEl = document.getElementById('gameover-reason');
    if (reasonEl) reasonEl.textContent = reason;

    if (this.gameoverScreen) {
      this.gameoverScreen.classList.remove('hidden');
      this.gameoverScreen.classList.add('active');
    }
  }

  showVictory(missionTitle = 'Mission Accomplished!') {
    const descEl = document.getElementById('victory-desc');
    if (descEl) descEl.textContent = `Completed ${missionTitle}! Safe zone reached.`;

    if (this.victoryScreen) {
      this.victoryScreen.classList.remove('hidden');
      this.victoryScreen.classList.add('active');
    }
  }

  hideAll() {
    [this.gameoverScreen, this.victoryScreen].forEach(s => {
      if (s) {
        s.classList.add('hidden');
        s.classList.remove('active');
      }
    });
  }
}
