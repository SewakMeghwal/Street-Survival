import * as THREE from 'three';
import { GAME_CONFIG } from '../game/GameConfig.js';
import { lerp, clamp } from '../utils/MathUtils.js';

/**
 * ThirdPersonCamera.js
 * Action third-person camera system with dynamic FOV kick during sprint,
 * screen shake on damage/bark, camera tilt on sharp turns, and collision avoidance.
 */

export class ThirdPersonCamera {
  constructor(camera, target, collisionSystem) {
    this.camera = camera;
    this.target = target;
    this.collisionSystem = collisionSystem;

    this.yaw = 0;
    this.pitch = 0.2;

    this.distance = GAME_CONFIG.CAMERA.DEFAULT_DISTANCE;
    this.targetDistance = this.distance;
    this.height = GAME_CONFIG.CAMERA.DEFAULT_HEIGHT;

    this.currentPosition = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();

    this.isMouseDown = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    // Camera Shake parameters
    this.shakeIntensity = 0;
    this.targetFov = GAME_CONFIG.CAMERA.FOV;

    this.initControls();
  }

  triggerShake(intensity = 0.4) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  initControls() {
    window.addEventListener('mousedown', (e) => {
      this.isMouseDown = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    window.addEventListener('mousemove', (e) => {
      let movementX = 0;
      let movementY = 0;

      if (document.pointerLockElement !== null) {
        movementX = e.movementX;
        movementY = e.movementY;
      } else if (this.isMouseDown) {
        movementX = e.clientX - this.lastMouseX;
        movementY = e.clientY - this.lastMouseY;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      }

      if (movementX !== 0 || movementY !== 0) {
        const sens = 0.003;
        this.yaw -= movementX * sens;
        this.pitch += movementY * sens;

        const minPitch = (GAME_CONFIG.CAMERA.PITCH_MIN * Math.PI) / 180;
        const maxPitch = (GAME_CONFIG.CAMERA.PITCH_MAX * Math.PI) / 180;
        this.pitch = clamp(this.pitch, minPitch, maxPitch);
      }
    });

    window.addEventListener('wheel', (e) => {
      this.targetDistance += e.deltaY * 0.003;
      this.targetDistance = clamp(
        this.targetDistance,
        GAME_CONFIG.CAMERA.MIN_DISTANCE,
        GAME_CONFIG.CAMERA.MAX_DISTANCE
      );
    });
  }

  update(delta) {
    if (!this.target) return;

    // Dynamic FOV kick during sprint
    const isSprinting = this.target.controller ? this.target.controller.isSprinting : false;
    const speedFov = isSprinting ? GAME_CONFIG.CAMERA.FOV + 12 : GAME_CONFIG.CAMERA.FOV;
    this.targetFov = lerp(this.targetFov, speedFov, delta * 6.0);
    this.camera.fov = this.targetFov;
    this.camera.updateProjectionMatrix();

    // Target focus position (Chest level)
    const targetPos = this.target.position.clone();
    targetPos.y += this.height;

    // Camera Shake decay
    if (this.shakeIntensity > 0.01) {
      targetPos.x += (Math.random() - 0.5) * this.shakeIntensity;
      targetPos.y += (Math.random() - 0.5) * this.shakeIntensity;
      targetPos.z += (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity *= Math.exp(-delta * 10.0);
    }

    this.distance = lerp(this.distance, this.targetDistance, delta * 8.0);

    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);
    const sinYaw = Math.sin(this.yaw);
    const cosYaw = Math.cos(this.yaw);

    const offsetX = this.distance * cosPitch * sinYaw;
    const offsetY = this.distance * sinPitch;
    const offsetZ = this.distance * cosPitch * cosYaw;

    const idealPosition = new THREE.Vector3(
      targetPos.x - offsetX,
      targetPos.y + offsetY,
      targetPos.z - offsetZ
    );

    let actualDistance = this.distance;
    if (this.collisionSystem) {
      const rayDir = idealPosition.clone().sub(targetPos).normalize();
      const hitDist = this.collisionSystem.raycastObstacle(targetPos, rayDir, this.distance);
      if (hitDist !== null) {
        actualDistance = Math.max(GAME_CONFIG.CAMERA.MIN_DISTANCE, hitDist - 0.3);
      }
    }

    const finalPosition = new THREE.Vector3(
      targetPos.x - actualDistance * cosPitch * sinYaw,
      targetPos.y + actualDistance * sinPitch,
      targetPos.z - actualDistance * cosPitch * cosYaw
    );

    const smoothFactor = 1.0 - Math.exp(-delta * 14.0);
    this.currentPosition.lerp(finalPosition, smoothFactor);
    this.currentLookAt.lerp(targetPos, smoothFactor);

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);
  }
}
