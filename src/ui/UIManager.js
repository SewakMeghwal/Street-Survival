import { HUD } from './HUD.js';
import { MainMenu } from './MainMenu.js';
import { PauseMenu } from './PauseMenu.js';
import { GameOverUI } from './GameOverUI.js';
import { DebugUI } from './DebugUI.js';
import { Minimap } from './Minimap.js';
import { AuthModal } from './AuthModal.js';

/**
 * UIManager.js
 * Central controller coordinating screen transitions, HUD updates,
 * minimap radar rendering, auth modals, and debug overlays.
 */

export class UIManager {
  constructor(game) {
    this.game = game;

    this.hud = new HUD();
    this.mainMenu = new MainMenu(game);
    this.pauseMenu = new PauseMenu(game);
    this.gameOverUI = new GameOverUI(game);
    this.debugUI = new DebugUI();
    this.minimap = new Minimap();
    this.authModal = new AuthModal(game);

    this.loadingScreen = document.getElementById('loading-screen');
    this.initAuthButtons();
  }

  initAuthButtons() {
    document.getElementById('btn-auth-open')?.addEventListener('click', () => {
      this.authModal.show();
    });
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
    this.authModal.updateUserUI();
    this.mainMenu.showScreen('main-menu');
  }

  showHUD() {
    this.mainMenu.showScreen('');
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
      this.hud.setDangerRadar(nearestDist < 14.0);
    }

    if (this.minimap && player) {
      this.minimap.update(player, dogManager, this.game.city.safeZones, this.game.camera);
    }

    this.debugUI.update(perfMonitor, player, dogManager, activeMission);
  }
}
