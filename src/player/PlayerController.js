import * as THREE from 'three';

/**
 * PlayerController.js
 * Captures keyboard & gamepad input.
 * Fixed sprint input handling across all shift key variants and movement directions.
 */

export class PlayerController {
  constructor(camera) {
    this.camera = camera;
    this.keys = {};
    this.shiftPressed = false;

    this.moveVector = new THREE.Vector3();
    this.isSprinting = false;
    this.isCrouching = false;
    this.jumpRequested = false;

    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.shiftKey) {
        this.shiftPressed = true;
      }

      if (e.code === 'KeyC') {
        this.isCrouching = !this.isCrouching;
      }
      if (e.code === 'Space') {
        this.jumpRequested = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.key === 'Shift' || e.code === 'ShiftLeft' || e.code === 'ShiftRight' || !e.shiftKey) {
        this.shiftPressed = false;
      }
    });
  }

  getMovementVector() {
    this.moveVector.set(0, 0, 0);

    let forward = 0;
    let side = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) forward += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) forward -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) side -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) side += 1;

    const isMoving = forward !== 0 || side !== 0;

    // Sprinting triggers when shift is held while moving in any direction
    this.isSprinting = isMoving && (this.shiftPressed || !!(this.keys['ShiftLeft'] || this.keys['ShiftRight'])) && !this.isCrouching;

    // Gamepad API integration
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (gamepads[0]) {
      const gp = gamepads[0];
      if (Math.abs(gp.axes[1]) > 0.15) forward -= gp.axes[1];
      if (Math.abs(gp.axes[0]) > 0.15) side += gp.axes[0];
      if (gp.buttons[0] && gp.buttons[0].pressed) this.jumpRequested = true;
      if (gp.buttons[1] && gp.buttons[1].pressed) this.isSprinting = true;
    }

    if (!isMoving) return this.moveVector;

    // Get camera forward and right directions projected onto XZ plane
    const camDir = new THREE.Vector3();
    this.camera.getWorldDirection(camDir);
    camDir.y = 0;
    camDir.normalize();

    const camRight = new THREE.Vector3().crossVectors(camDir, new THREE.Vector3(0, 1, 0)).negate();

    this.moveVector.addScaledVector(camDir, forward);
    this.moveVector.addScaledVector(camRight, side);
    this.moveVector.normalize();

    return this.moveVector;
  }

  consumeJump() {
    if (this.jumpRequested) {
      this.jumpRequested = false;
      return true;
    }
    return false;
  }
}
