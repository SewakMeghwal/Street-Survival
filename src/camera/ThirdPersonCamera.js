import * as THREE from 'three';
import { GAME_CONFIG } from '../game/GameConfig.js';
import { lerp, clamp } from '../utils/MathUtils.js';

/**
 * ThirdPersonCamera.js
 * Polished collision-aware third-person camera system.
 * Follows player smoothly, handles pointer lock AND mouse drag rotation,
 * raycasting against obstacles to prevent clipping.
 */

export class ThirdPersonCamera {
  constructor(camera, target, collisionSystem) {
    this.camera = camera;
    this.target = target;
    this.collisionSystem = collisionSystem;

    this.yaw = 0;   // Horizontal rotation
    this.pitch = 0.2; // Vertical rotation

    this.distance = GAME_CONFIG.CAMERA.DEFAULT_DISTANCE;
    this.targetDistance = this.distance;
    this.height = GAME_CONFIG.CAMERA.DEFAULT_HEIGHT;

    this.currentPosition = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();

    this.isMouseDown = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.initControls();
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
        // Pointer Lock active
        movementX = e.movementX;
        movementY = e.movementY;
      } else if (this.isMouseDown) {
        // Drag rotation fallback
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

    const targetPos = this.target.position.clone();
    targetPos.y += this.height;

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
