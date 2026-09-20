import * as THREE from 'three';
import { Mission } from './Mission.js';
import { GAME_CONFIG } from '../game/GameConfig.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { audioSystem } from '../systems/AudioSystem.js';

/**
 * MissionManager.js
 * Manages mission list, objective tracking, wave triggers, and completion checks.
 */

export class MissionManager {
  constructor(game) {
    this.game = game;
    this.activeMission = null;
    this.missionTimer = 0;
    this.missions = [];

    this.initMissions();
  }

  initMissions() {
    this.missions = [
      new Mission({
        id: 1,
        title: 'MISSION 1: GET HOME',
        description: 'Escape the streets and reach your Safe House.',
        playerSpawn: new THREE.Vector3(0, 0, -80),
        safeZonePos: new THREE.Vector3(0, 0, 35),
        dogSpawns: [
          { type: 'STRAY', pos: new THREE.Vector3(5, 0, -40) },
          { type: 'STRAY', pos: new THREE.Vector3(-10, 0, -10) }
        ]
      }),
      new Mission({
        id: 2,
        title: 'MISSION 2: THE ALLEY',
        description: 'Cross the market alley and reach the Police Station booth.',
        playerSpawn: new THREE.Vector3(-80, 0, -35),
        safeZonePos: new THREE.Vector3(65, 0, 65),
        dogSpawns: [
          { type: 'STRAY', pos: new THREE.Vector3(-55, 0, 14) },
          { type: 'FAST', pos: new THREE.Vector3(-35, 0, 14) },
          { type: 'HEAVY', pos: new THREE.Vector3(0, 0, 30) }
        ]
      }),
      new Mission({
        id: 3,
        title: 'MISSION 3: TRAPPED',
        description: 'Survive in the central plaza for 2 minutes against dog waves!',
        playerSpawn: new THREE.Vector3(0, 0, 0),
        safeZonePos: new THREE.Vector3(0, 0, 0),
        timeLimit: 120, // 2 minutes survival
        dogSpawns: [
          { type: 'STRAY', pos: new THREE.Vector3(25, 0, 25) },
          { type: 'FAST', pos: new THREE.Vector3(-25, 0, -25) },
          { type: 'FAST', pos: new THREE.Vector3(25, 0, -25) },
          { type: 'HEAVY', pos: new THREE.Vector3(-25, 0, 25) }
        ]
      }),
      new Mission({
        id: 4,
        title: 'MISSION 4: THE PACK',
        description: 'Reach the Industrial Warehouse while hunted by an Alpha Pack.',
        playerSpawn: new THREE.Vector3(80, 0, -80),
        safeZonePos: new THREE.Vector3(-125, 0, 40),
        dogSpawns: [
          { type: 'LEADER', pos: new THREE.Vector3(40, 0, -40) },
          { type: 'FAST', pos: new THREE.Vector3(45, 0, -35) },
          { type: 'FAST', pos: new THREE.Vector3(35, 0, -45) },
          { type: 'HEAVY', pos: new THREE.Vector3(20, 0, -20) },
          { type: 'STRAY', pos: new THREE.Vector3(0, 0, 0) }
        ]
      }),
      new Mission({
        id: 5,
        title: 'MISSION 5: NIGHT RUN',
        description: 'Survive a nocturnal escape through Survival Nagar at night.',
        playerSpawn: new THREE.Vector3(-120, 0, -80),
        safeZonePos: new THREE.Vector3(65, 0, 65),
        isNight: true,
        weather: 'RAIN',
        dogSpawns: [
          { type: 'LEADER', pos: new THREE.Vector3(-80, 0, -40) },
          { type: 'FAST', pos: new THREE.Vector3(-50, 0, 0) },
          { type: 'FAST', pos: new THREE.Vector3(0, 0, 40) },
          { type: 'HEAVY', pos: new THREE.Vector3(30, 0, 50) }
        ]
      })
    ];
  }

  loadMission(missionId) {
    const mission = this.missions.find(m => m.id === missionId) || this.missions[0];
    this.activeMission = mission;
    this.missionTimer = mission.timeLimit;

    // 1. Reset player position
    this.game.player.reset(mission.playerSpawn);

    // 2. Setup Safe Zones
    this.game.city.safeZones.clear();
    this.game.city.safeZones.addSafeZone(mission.safeZonePos, mission.safeZoneRadius, 'Safe House');

    // 3. Spawn Dogs
    this.game.dogManager.clear();
    mission.dogSpawns.forEach(spawn => {
      const typeConfig = GAME_CONFIG.DOG_TYPES[spawn.type] || GAME_CONFIG.DOG_TYPES.STRAY;
      this.game.dogManager.spawnDog(typeConfig, spawn.pos);
    });

    // 4. Set Day/Night & Weather
    this.game.dayNightSystem.setNightMode(mission.isNight);
    this.game.weatherSystem.setWeather(mission.weather);

    // 5. Update HUD UI
    if (this.game.uiManager) {
      this.game.uiManager.updateMissionHUD(mission.title, mission.description);
    }
  }

  update(delta) {
    if (!this.activeMission || !this.game.player) return;

    if (this.activeMission.timeLimit > 0) {
      this.missionTimer -= delta;

      if (this.game.uiManager) {
        const remaining = Math.max(0, Math.ceil(this.missionTimer));
        this.game.uiManager.updateMissionHUD(
          this.activeMission.title,
          `Survive! Time Remaining: ${remaining}s`
        );
      }

      if (this.missionTimer <= 0) {
        // Survival time limit reached!
        this.completeMission();
        return;
      }
    }

    // Check reach safe zone condition (for reach objective missions)
    if (this.activeMission.timeLimit === 0) {
      const isPlayerSafe = this.game.city.safeZones.isPositionInSafeZone(this.game.player.position);
      if (isPlayerSafe) {
        this.completeMission();
      }
    }
  }

  completeMission() {
    audioSystem.playVictory();
    SaveSystem.completeMission(this.activeMission.id);
    this.game.onMissionVictory(this.activeMission);
  }
}
