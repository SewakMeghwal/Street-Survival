import * as THREE from 'three';
import { GAME_CONFIG } from './GameConfig.js';
import { GameState, GAME_STATES } from './GameState.js';
import { GameLoop } from './GameLoop.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { DayNightSystem } from '../systems/DayNightSystem.js';
import { WeatherSystem } from '../systems/WeatherSystem.js';
import { City } from '../world/City.js';
import { Player } from '../player/Player.js';
import { ThirdPersonCamera } from '../camera/ThirdPersonCamera.js';
import { DogManager } from '../ai/DogManager.js';
import { MissionManager } from '../missions/MissionManager.js';
import { UIManager } from '../ui/UIManager.js';
import { PerformanceMonitor } from '../utils/PerformanceMonitor.js';

/**
 * Game.js
 * Master game engine class orchestrating WebGL canvas, Three.js renderer,
 * physics, camera, player, AI dog packs, missions, audio, and UI overlays.
 */

export class Game {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    if (!this.canvas) {
      throw new Error('WebGL Canvas element not found.');
    }

    this.state = new GameState(GAME_STATES.MENU);
    this.perfMonitor = new PerformanceMonitor();

    this.initThreeJS();
    this.initSystems();
    this.initEventListeners();

    this.uiManager = new UIManager(this);

    this.gameLoop = new GameLoop(
      (delta) => this.update(delta),
      (delta) => this.render(delta)
    );

    // Boot complete
    setTimeout(() => {
      this.uiManager.hideLoadingScreen();
      this.uiManager.showMainMenu();
      this.gameLoop.start();
    }, 600);
  }

  initThreeJS() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      GAME_CONFIG.CAMERA.FOV,
      window.innerWidth / window.innerHeight,
      GAME_CONFIG.CAMERA.NEAR,
      GAME_CONFIG.CAMERA.FAR
    );

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  initSystems() {
    this.collisionSystem = new CollisionSystem();
    this.dayNightSystem = new DayNightSystem(this.scene);
    this.weatherSystem = new WeatherSystem(this.scene);

    this.city = new City(this.scene, this.collisionSystem, this.dayNightSystem);
    this.player = new Player(this.scene, this.camera, this.collisionSystem, 'male');
    this.thirdPersonCamera = new ThirdPersonCamera(this.camera, this.player, this.collisionSystem);

    this.dogManager = new DogManager(this.scene, this.collisionSystem);
    this.missionManager = new MissionManager(this);

    // Hook hit callback to UI damage flash
    this.player.stats.onHit = () => {
      if (this.uiManager) this.uiManager.hud.triggerDamageFlash();
    };

    // Hook death callback
    this.player.stats.onDeath = () => {
      this.state.set(GAME_STATES.GAMEOVER);
      this.uiManager.showGameOver('The stray dog pack overwhelmed you.');
    };
  }

  initEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        if (this.state.is(GAME_STATES.PLAYING)) {
          this.pauseGame();
        } else if (this.state.is(GAME_STATES.PAUSED)) {
          this.resumeGame();
        }
      }
    });

    // Pointer lock for mouse camera look on canvas click
    this.canvas.addEventListener('click', () => {
      if (this.state.is(GAME_STATES.PLAYING)) {
        this.canvas.requestPointerLock();
      }
    });
  }

  startMission(missionId) {
    this.missionManager.loadMission(missionId);
    this.state.set(GAME_STATES.PLAYING);
    this.uiManager.showHUD();
    this.canvas.requestPointerLock();
  }

  restartCurrentMission() {
    if (this.missionManager.activeMission) {
      this.startMission(this.missionManager.activeMission.id);
    } else {
      this.startMission(1);
    }
  }

  startNextMission() {
    const currentId = this.missionManager.activeMission ? this.missionManager.activeMission.id : 1;
    const nextId = currentId + 1;
    if (nextId <= this.missionManager.missions.length) {
      this.startMission(nextId);
    } else {
      this.returnToMainMenu();
    }
  }

  pauseGame() {
    this.state.set(GAME_STATES.PAUSED);
    document.exitPointerLock();
    this.uiManager.showPauseMenu();
  }

  resumeGame() {
    this.state.set(GAME_STATES.PLAYING);
    this.uiManager.hidePauseMenu();
    this.canvas.requestPointerLock();
  }

  returnToMainMenu() {
    this.state.set(GAME_STATES.MENU);
    document.exitPointerLock();
    this.uiManager.showMainMenu();
  }

  onMissionVictory(mission) {
    this.state.set(GAME_STATES.VICTORY);
    document.exitPointerLock();
    this.uiManager.showVictory(mission.title);
  }

  update(delta) {
    this.perfMonitor.update(this.renderer);

    if (this.state.is(GAME_STATES.PLAYING)) {
      this.player.update(delta);
      this.thirdPersonCamera.update(delta);

      this.dogManager.update(delta, this.player, this.city.safeZones);
      this.missionManager.update(delta);

      this.dayNightSystem.update(delta);
      this.weatherSystem.update(delta, this.player.position);
      this.city.update(delta);

      // Check player in safe zone for HUD banner
      const inSafe = this.city.safeZones.isPositionInSafeZone(this.player.position);
      this.uiManager.hud.setSafeZoneBanner(inSafe);
    }

    if (this.uiManager) {
      this.uiManager.update(
        this.perfMonitor,
        this.player,
        this.dogManager,
        this.missionManager.activeMission
      );
    }
  }

  render(delta) {
    this.renderer.render(this.scene, this.camera);
  }
}
