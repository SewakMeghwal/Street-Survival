import { HUD } from './HUD.js';
import { MainMenu } from './MainMenu.js';
import { PauseMenu } from './PauseMenu.js';
import { GameOverUI } from './GameOverUI.js';
import { DebugUI } from './DebugUI.js';

/**
 * UIManager.js
 * Central controller coordinating all screen transitions, HUD updates,
 * pause modals, game over summaries, and debug overlays.
 */

export class UIManager {
  constructor(game) {
    this.game = game;

    this.hud = new HUD();
    this.mainMenu = new MainMenu(game);
    this.pauseMenu = new PauseMenu(game);
    this.gameOverUI = new GameOverUI(game);
    this.debugUI = new DebugUI();

    this.loadingScreen = document.getElementById('loading-screen');
  }

  hideLoadingScreen() {
    if (this.loadingScreen) {
      this.loadingScreen.style.display = 'none';
    }
  }

  showMainMenu() {
    this.hud.hide();
    this.pauseMenu.hide();
    this.gameOverUI.hideAll();
    this.mainMenu.showScreen('main-menu');
  }

  showHUD() {
    this.mainMenu.showScreen(''); // Hide menus
    this.pauseMenu.hide();
    this.gameOverUI.hideAll();
    this.hud.show();
  }

  showPauseMenu() {
    this.pauseMenu.show();
  }

  hidePauseMenu() {
    this.pauseMenu.hide();
  }

  showGameOver(reason) {
    this.hud.hide();
    this.gameOverUI.showGameOver(reason);
  }

  showVictory(missionTitle) {
    this.hud.hide();
    this.gameOverUI.showVictory(missionTitle);
  }

  updateMissionHUD(title, desc) {
    this.hud.updateMission(title, desc);
  }

  updatePlayerHUD(player) {
    if (!player) return;
    this.hud.updateHealth(player.stats.health, player.stats.maxHealth);
    this.hud.updateStamina(player.stats.stamina, player.stats.maxStamina, player.stats.isExhausted);
  }

  update(perfMonitor, player, dogManager, activeMission) {
    this.updatePlayerHUD(player);

    if (dogManager && player) {
      const nearestDist = dogManager.getNearestDogDistance(player.position);
      this.hud.setDangerRadar(nearestDist < 12.0);
    }

    this.debugUI.update(perfMonitor, player, dogManager, activeMission);
  }
}
