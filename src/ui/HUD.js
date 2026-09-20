/**
 * HUD.js
 * In-game Heads-Up Display managing health bar, stamina bar, objective notifications,
 * danger radar warning, hit flash vignette, and safe zone alerts.
 */

export class HUD {
  constructor() {
    this.container = document.getElementById('hud-container');
    this.healthBar = document.getElementById('health-bar');
    this.healthValue = document.getElementById('health-value');
    this.staminaBar = document.getElementById('stamina-bar');
    this.staminaValue = document.getElementById('stamina-value');
    this.staminaContainer = document.getElementById('stamina-bar-container');
    this.missionTitle = document.getElementById('mission-title-hud');
    this.missionDesc = document.getElementById('mission-desc-hud');
    this.dangerRadar = document.getElementById('danger-radar');
    this.damageFlash = document.getElementById('damage-flash');
    this.safezoneBanner = document.getElementById('safezone-banner');
  }

  show() {
    if (this.container) this.container.style.display = 'flex';
  }

  hide() {
    if (this.container) this.container.style.display = 'none';
  }

  updateHealth(current, max) {
    const pct = Math.max(0, Math.min(100, (current / max) * 100));
    if (this.healthBar) this.healthBar.style.width = `${pct}%`;
    if (this.healthValue) this.healthValue.textContent = `${Math.ceil(current)} / ${max}`;
  }

  updateStamina(current, max, isExhausted) {
    const pct = Math.max(0, Math.min(100, (current / max) * 100));
    if (this.staminaBar) this.staminaBar.style.width = `${pct}%`;
    if (this.staminaValue) this.staminaValue.textContent = `${Math.ceil(current)} / ${max}`;

    if (this.staminaContainer) {
      if (isExhausted) {
        this.staminaContainer.classList.add('stamina-low');
      } else {
        this.staminaContainer.classList.remove('stamina-low');
      }
    }
  }

  updateMission(title, desc) {
    if (this.missionTitle) this.missionTitle.textContent = title;
    if (this.missionDesc) this.missionDesc.textContent = desc;
  }

  setDangerRadar(active) {
    if (this.dangerRadar) {
      if (active) this.dangerRadar.classList.add('active');
      else this.dangerRadar.classList.remove('active');
    }
  }

  triggerDamageFlash() {
    if (this.damageFlash) {
      this.damageFlash.style.opacity = '1';
      setTimeout(() => {
        if (this.damageFlash) this.damageFlash.style.opacity = '0';
      }, 150);
    }
  }

  setSafeZoneBanner(show) {
    if (this.safezoneBanner) {
      if (show) this.safezoneBanner.classList.add('show');
      else this.safezoneBanner.classList.remove('show');
    }
  }
}
