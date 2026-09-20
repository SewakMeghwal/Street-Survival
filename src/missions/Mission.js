/**
 * Mission.js
 * Mission definition containing objective type, spawn positions, target safe zone,
 * timer conditions, and dog wave configurations.
 */

export class Mission {
  constructor(config) {
    this.id = config.id;
    this.title = config.title;
    this.description = config.description;
    this.playerSpawn = config.playerSpawn;
    this.safeZonePos = config.safeZonePos;
    this.safeZoneRadius = config.safeZoneRadius || 8.0;
    this.dogSpawns = config.dogSpawns || []; // Array of { type: string, pos: Vector3 }
    this.timeLimit = config.timeLimit || 0;  // 0 = no time limit, >0 = survive duration in sec
    this.isNight = !!config.isNight;
    this.weather = config.weather || 'CLEAR';
  }
}
