import { SaveSystem } from '../systems/SaveSystem.js';

/**
 * AuthModal.js
 * User Account Authentication & Milestone Tracker.
 * Supports Login, Sign Up, Guest Mode, and Personal Progress Milestones.
 */

export class AuthModal {
  constructor(game) {
    this.game = game;
    this.screen = document.getElementById('auth-menu');
    this.currentUser = SaveSystem.getCurrentUser();

    this.initEventListeners();
    this.updateUserUI();
  }

  initEventListeners() {
    // Guest Mode Button
    document.getElementById('btn-guest-play')?.addEventListener('click', () => {
      SaveSystem.setUser({ username: 'Guest Survivor', isGuest: true });
      this.updateUserUI();
      this.hide();
      this.game.startMission(1);
    });

    // Login Form
    document.getElementById('btn-login-submit')?.addEventListener('click', () => {
      const usernameInput = document.getElementById('auth-username');
      const name = usernameInput && usernameInput.value.trim() ? usernameInput.value.trim() : 'Survivor';

      const userData = SaveSystem.setUser({
        username: name,
        isGuest: false,
        token: 'auth_' + Date.now()
      });

      this.updateUserUI();
      this.hide();
    });

    // Logout
    document.getElementById('btn-user-logout')?.addEventListener('click', () => {
      SaveSystem.logoutUser();
      this.updateUserUI();
    });
  }

  updateUserUI() {
    const user = SaveSystem.getCurrentUser();
    const userBadge = document.getElementById('user-profile-badge');
    const milestonesCard = document.getElementById('milestone-stats-card');

    if (userBadge) {
      userBadge.textContent = user.isGuest ? 'GUEST SURVIVOR' : `SURVIVOR: ${user.username.toUpperCase()}`;
    }

    if (milestonesCard) {
      const stats = SaveSystem.getMilestones();
      milestonesCard.innerHTML = `
        <div style="font-size:0.75rem; color:#ff9f43; font-weight:800; text-transform:uppercase; margin-bottom:6px;">PERSONAL MILESTONES</div>
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;"><span>Missions Completed:</span> <strong>${stats.completedMissions.length} / 5</strong></div>
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;"><span>Survival Time:</span> <strong>${Math.floor(stats.totalSurvivalTime || 0)}s</strong></div>
        <div style="display:flex; justify-content:space-between; font-size:0.85rem;"><span>Dogs Evaded:</span> <strong>${stats.dogsEvaded || 0}</strong></div>
      `;
    }
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
