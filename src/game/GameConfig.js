/**
 * GameConfig.js
 * Centralized game configuration, parameters, keybindings, and dog AI balance settings.
 */

export const GAME_CONFIG = {
  TITLE: 'Street Survival',
  VERSION: '1.0.0',
  DEBUG_DEFAULT: false,

  // Player Stats & Physics
  PLAYER: {
    MAX_HEALTH: 100,
    MAX_STAMINA: 100,
    WALK_SPEED: 4.5,
    RUN_SPEED: 7.0,
    SPRINT_SPEED: 10.5,
    CROUCH_SPEED: 2.5,
    JUMP_FORCE: 7.5,
    GRAVITY: -22.0,
    HEIGHT: 1.8,
    RADIUS: 0.45,
    STAMINA_DRAIN_RATE: 22.0,    // per sec when sprinting
    STAMINA_REGEN_RATE: 16.0,    // per sec when walking/idle
    STAMINA_REGEN_DELAY: 0.8,    // sec after sprint before regen starts
    INVULNERABILITY_TIME: 0.9,   // sec post-hit invulnerability window
    EXHAUSTION_THRESHOLD: 15.0   // minimum stamina to initiate sprint again
  },

  // Dog Types Data
  DOG_TYPES: {
    STRAY: {
      name: 'Stray Dog',
      speed: 7.8,
      hp: 50,
      damage: 12,
      attackRange: 1.6,
      attackCooldown: 1.2,
      noticeRadius: 18.0,
      chaseRadius: 24.0,
      color: 0x8b5a2b,
      scale: 1.0
    },
    FAST: {
      name: 'Hound / Fast Dog',
      speed: 10.2,
      hp: 30,
      damage: 8,
      attackRange: 1.5,
      attackCooldown: 0.9,
      noticeRadius: 22.0,
      chaseRadius: 28.0,
      color: 0xd2b48c,
      scale: 0.85
    },
    HEAVY: {
      name: 'Mastiff / Heavy Dog',
      speed: 5.8,
      hp: 110,
      damage: 22,
      attackRange: 1.8,
      attackCooldown: 1.5,
      noticeRadius: 15.0,
      chaseRadius: 20.0,
      color: 0x3d2817,
      scale: 1.25
    },
    LEADER: {
      name: 'Alpha Dog',
      speed: 8.8,
      hp: 85,
      damage: 16,
      attackRange: 1.7,
      attackCooldown: 1.1,
      noticeRadius: 25.0,
      chaseRadius: 32.0,
      color: 0x1a1a1a,
      scale: 1.15,
      isLeader: true
    }
  },

  // Camera Settings
  CAMERA: {
    FOV: 65,
    NEAR: 0.1,
    FAR: 500,
    DEFAULT_DISTANCE: 4.8,
    DEFAULT_HEIGHT: 2.2,
    MIN_DISTANCE: 1.5,
    MAX_DISTANCE: 8.0,
    PITCH_MIN: -15, // deg
    PITCH_MAX: 65,  // deg
    SMOOTH_FACTOR: 0.15,
    ROTATION_SPEED: 0.0022
  },

  // Environment & World Settings
  WORLD: {
    MAP_SIZE: 300,
    CHUNK_SIZE: 50,
    SAFE_ZONE_RADIUS: 8.0,
    DAY_DURATION_SEC: 180, // Full day night loop duration
    SUN_HEIGHT_DAY: 45,
    SUN_HEIGHT_NIGHT: -20
  }
};
