import * as THREE from 'three';
import { GAME_CONFIG } from '../game/GameConfig.js';
import { ProceduralMeshFactory } from '../utils/ProceduralMeshFactory.js';
import { PlayerController } from './PlayerController.js';
import { PlayerStats } from './PlayerStats.js';
import { PlayerAnimation } from './PlayerAnimation.js';
import { audioSystem } from '../systems/AudioSystem.js';

/**
 * Player.js
 * Complete player entity orchestrating mesh, movement physics, stamina/health stats,
 * limb animations, and world collision resolution.
 */

export class Player {
  constructor(scene, camera, collisionSystem, gender = 'male') {
    this.scene = scene;
    this.camera = camera;
    this.collisionSystem = collisionSystem;
    this.gender = gender;

    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.forward = new THREE.Vector3(0, 0, 1);

    this.isGrounded = true;
    this.rotationAngle = 0;

    this.stats = new PlayerStats();
    this.controller = new PlayerController(camera);

    this.initMesh(gender);
  }

  initMesh(gender) {
    if (this.meshGroup) {
      this.scene.remove(this.meshGroup);
    }

    const { mesh, joints } = ProceduralMeshFactory.createPlayerMesh(gender);
    this.meshGroup = mesh;
    this.joints = joints;
    this.animator = new PlayerAnimation(joints);

    this.scene.add(this.meshGroup);
  }

  setGender(gender) {
    if (this.gender !== gender) {
      this.gender = gender;
      this.initMesh(gender);
    }
  }

  reset(position = new THREE.Vector3(0, 0, 0)) {
    this.position.copy(position);
    this.velocity.set(0, 0, 0);
    this.meshGroup.position.copy(position);
    this.meshGroup.rotation.y = 0;
    this.stats.reset();
  }

  update(delta) {
    if (this.stats.health <= 0) {
      this.animator.setState('DEAD');
      this.meshGroup.rotation.z = Math.PI / 2; // Collapse to floor
      return;
    }

    // 1. Get user movement input
    const moveInput = this.controller.getMovementVector();
    let currentSpeed = GAME_CONFIG.PLAYER.WALK_SPEED;

    const isSprinting = this.controller.isSprinting && moveInput.lengthSq() > 0;

    if (isSprinting && !this.stats.isExhausted) {
      if (this.stats.consumeStamina(delta)) {
        currentSpeed = GAME_CONFIG.PLAYER.SPRINT_SPEED;
      }
    } else if (moveInput.lengthSq() > 0) {
      currentSpeed = GAME_CONFIG.PLAYER.RUN_SPEED;
    }

    if (this.controller.isCrouching) {
      currentSpeed = GAME_CONFIG.PLAYER.CROUCH_SPEED;
    }

    this.stats.update(delta, isSprinting);

    // 2. Apply movement velocity in XZ plane
    if (moveInput.lengthSq() > 0) {
      this.velocity.x = moveInput.x * currentSpeed;
      this.velocity.z = moveInput.z * currentSpeed;

      // Smoothly rotate character toward movement direction
      const targetAngle = Math.atan2(moveInput.x, moveInput.z);
      this.rotationAngle = THREE.MathUtils.lerp(this.rotationAngle, targetAngle, delta * 12.0);
      this.meshGroup.rotation.y = this.rotationAngle;
      this.forward.set(Math.sin(this.rotationAngle), 0, Math.cos(this.rotationAngle));
    } else {
      this.velocity.x *= 0.1;
      this.velocity.z *= 0.1;
    }

    // 3. Jump and Gravity Physics
    if (this.controller.consumeJump() && this.isGrounded) {
      this.velocity.y = GAME_CONFIG.PLAYER.JUMP_FORCE;
      this.isGrounded = false;
      audioSystem.playFootstep(0.4);
    }

    if (!this.isGrounded) {
      this.velocity.y += GAME_CONFIG.PLAYER.GRAVITY * delta;
    }

    // Apply movement delta
    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;
    this.position.z += this.velocity.z * delta;

    // Ground snap check
    if (this.position.y <= 0) {
      this.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
    }

    // 4. Resolve World AABB Collisions
    if (this.collisionSystem) {
      this.collisionSystem.resolveCapsuleCollision(
        this.position,
        GAME_CONFIG.PLAYER.RADIUS,
        GAME_CONFIG.PLAYER.HEIGHT
      );
    }

    // Sync mesh position
    this.meshGroup.position.copy(this.position);

    // 5. Update animation states
    const horizSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
    this.animator.update(delta, horizSpeed, this.isGrounded);
  }
}
