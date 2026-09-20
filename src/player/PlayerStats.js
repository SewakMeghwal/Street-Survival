import { GAME_CONFIG } from '../game/GameConfig.js';
import { audioSystem } from '../systems/AudioSystem.js';

/**
 * PlayerStats.js
 * Manages player health, stamina drain & regeneration, invulnerability window,
 * hit reaction cooldowns, and exhaustion state.
 */

export class PlayerStats {
  constructor() {
    this.maxHealth = GAME_CONFIG.PLAYER.MAX_HEALTH;
    this.health = this.maxHealth;

    this.maxStamina = GAME_CONFIG.PLAYER.MAX_STAMINA;
    this.stamina = this.maxStamina;

    this.isExhausted = false;
    this.isInvulnerable = false;
    this.invulnerableTimer = 0;
    this.staminaRegenDelayTimer = 0;

    this.onHealthChange = null;
    this.onStaminaChange = null;
    this.onHit = null;
    this.onDeath = null;
  }

  reset() {
    this.health = this.maxHealth;
    this.stamina = this.maxStamina;
    this.isExhausted = false;
    this.isInvulnerable = false;
    this.invulnerableTimer = 0;
    this.staminaRegenDelayTimer = 0;
  }

  takeDamage(amount) {
    if (this.isInvulnerable || this.health <= 0) return false;

    this.health = Math.max(0, this.health - amount);
    this.isInvulnerable = true;
    this.invulnerableTimer = GAME_CONFIG.PLAYER.INVULNERABILITY_TIME;

    audioSystem.playHit();

    if (this.onHealthChange) this.onHealthChange(this.health, this.maxHealth);
    if (this.onHit) this.onHit(amount);

    if (this.health <= 0 && this.onDeath) {
      this.onDeath();
    }

    return true;
  }

  consumeStamina(delta) {
    if (this.isExhausted) return false;

    this.stamina -= GAME_CONFIG.PLAYER.STAMINA_DRAIN_RATE * delta;
    this.staminaRegenDelayTimer = GAME_CONFIG.PLAYER.STAMINA_REGEN_DELAY;

    if (this.stamina <= 0) {
      this.stamina = 0;
      this.isExhausted = true; // Temporary exhaustion penalty
    }

    if (this.onStaminaChange) this.onStaminaChange(this.stamina, this.maxStamina, this.isExhausted);
    return true;
  }

  update(delta, isSprinting) {
    // Update invulnerability flash timer
    if (this.isInvulnerable) {
      this.invulnerableTimer -= delta;
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
        this.invulnerableTimer = 0;
      }
    }

    // Stamina recovery when not sprinting
    if (!isSprinting) {
      if (this.staminaRegenDelayTimer > 0) {
        this.staminaRegenDelayTimer -= delta;
      } else if (this.stamina < this.maxStamina) {
        this.stamina = Math.min(this.maxStamina, this.stamina + GAME_CONFIG.PLAYER.STAMINA_REGEN_RATE * delta);

        if (this.isExhausted && this.stamina >= GAME_CONFIG.PLAYER.EXHAUSTION_THRESHOLD) {
          this.isExhausted = false;
        }

        if (this.onStaminaChange) this.onStaminaChange(this.stamina, this.maxStamina, this.isExhausted);
      }
    }
  }
}
