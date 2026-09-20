import * as THREE from 'three';
import { ProceduralMeshFactory } from '../utils/ProceduralMeshFactory.js';
import { DogStateMachine, DOG_STATES } from './DogStateMachine.js';
import { DogAI } from './DogAI.js';
import { Pathfinding } from './Pathfinding.js';
import { distanceXZ, lerp } from '../utils/MathUtils.js';
import { audioSystem } from '../systems/AudioSystem.js';

/**
 * Dog.js
 * Dog enemy entity representing individual stray, fast, heavy, or leader dogs.
 * Handles state transitions, movement steering, attack cooldowns, audio barks, and health.
 */

export class Dog {
  constructor(scene, typeConfig, spawnPos, collisionSystem) {
    this.scene = scene;
    this.config = typeConfig;
    this.collisionSystem = collisionSystem;

    this.position = spawnPos.clone();
    this.spawnPosition = spawnPos.clone();
    this.velocity = new THREE.Vector3();
    this.forward = new THREE.Vector3(0, 0, 1);
    this.rotationAngle = Math.random() * Math.PI * 2;

    this.health = typeConfig.hp;
    this.maxHealth = typeConfig.hp;
    this.attackCooldownTimer = 0;
    this.barkTimer = Math.random() * 3.0;

    this.tacticalTargetPos = new THREE.Vector3();
    this.tacticalRole = 'CHASE'; // 'CHASE', 'FLANK_LEFT', 'FLANK_RIGHT', 'INTERCEPT'

    this.fsm = new DogStateMachine(this);
    this.ai = new DogAI(this, collisionSystem);
    this.pathfinding = new Pathfinding(collisionSystem);

    this.initMesh();
    this.fsm.changeState(DOG_STATES.PATROL);
  }

  initMesh() {
    const { mesh, joints } = ProceduralMeshFactory.createDogMesh(this.config);
    this.meshGroup = mesh;
    this.joints = joints;
    this.meshGroup.position.copy(this.position);
    this.scene.add(this.meshGroup);
  }

  destroy() {
    if (this.meshGroup) {
      this.scene.remove(this.meshGroup);
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.fsm.changeState(DOG_STATES.DEAD);
      this.meshGroup.rotation.z = Math.PI / 2;
    }
  }

  update(delta, player, isInSafeZone) {
    if (this.fsm.currentState === DOG_STATES.DEAD) return;

    // Cooldown timers
    if (this.attackCooldownTimer > 0) this.attackCooldownTimer -= delta;

    // Bark audio interval when chasing player
    if (this.fsm.currentState === DOG_STATES.CHASE || this.fsm.currentState === DOG_STATES.ATTACK) {
      this.barkTimer -= delta;
      if (this.barkTimer <= 0) {
        audioSystem.playBark(0.5);
        this.barkTimer = 2.5 + Math.random() * 2.0;
      }
    }

    // Safe zone enforcement: Dogs immediately stop chasing when player is in safe zone!
    if (isInSafeZone && (this.fsm.currentState === DOG_STATES.CHASE || this.fsm.currentState === DOG_STATES.ATTACK)) {
      this.fsm.changeState(DOG_STATES.RETURN);
    }

    const canSee = this.ai.canSeePlayer(player);

    // State Transitions
    switch (this.fsm.currentState) {
      case DOG_STATES.PATROL:
        if (canSee && !isInSafeZone) {
          this.fsm.changeState(DOG_STATES.CHASE);
          audioSystem.playGrowl(0.6);
        } else {
          // Wander around spawn position
          if (distanceXZ(this.position, this.spawnPosition) > 15.0) {
            this.tacticalTargetPos.copy(this.spawnPosition);
          } else if (Math.random() < 0.01) {
            this.tacticalTargetPos.set(
              this.spawnPosition.x + (Math.random() - 0.5) * 10,
              0,
              this.spawnPosition.z + (Math.random() - 0.5) * 10
            );
          }
        }
        break;

      case DOG_STATES.CHASE:
      case DOG_STATES.FLANK:
      case DOG_STATES.SURROUND:
        if (isInSafeZone) {
          this.fsm.changeState(DOG_STATES.RETURN);
          break;
        }

        if (!canSee) {
          if (this.fsm.stateTimer > 3.0) {
            this.fsm.changeState(DOG_STATES.SEARCH);
          }
        } else {
          const distToPlayer = distanceXZ(this.position, player.position);
          if (distToPlayer <= this.config.attackRange) {
            this.fsm.changeState(DOG_STATES.ATTACK);
          }
        }
        break;

      case DOG_STATES.ATTACK:
        const dist = distanceXZ(this.position, player.position);
        if (dist > this.config.attackRange * 1.5) {
          this.fsm.changeState(DOG_STATES.CHASE);
        } else if (this.attackCooldownTimer <= 0 && !isInSafeZone) {
          // Perform Attack
          player.stats.takeDamage(this.config.damage);
          this.attackCooldownTimer = this.config.attackCooldown;
          audioSystem.playBark(0.8);
        }
        break;

      case DOG_STATES.SEARCH:
        this.tacticalTargetPos.copy(this.ai.lastKnownPlayerPos);
        if (this.fsm.stateTimer > 4.0 || distanceXZ(this.position, this.tacticalTargetPos) < 2.0) {
          this.fsm.changeState(DOG_STATES.RETURN);
        }
        break;

      case DOG_STATES.RETURN:
        this.tacticalTargetPos.copy(this.spawnPosition);
        if (distanceXZ(this.position, this.spawnPosition) < 2.0) {
          this.fsm.changeState(DOG_STATES.PATROL);
        }
        break;
    }

    // Execute Movement towards tacticalTargetPos
    let speed = this.config.speed;
    if (this.fsm.currentState === DOG_STATES.PATROL) speed *= 0.4;
    if (this.fsm.currentState === DOG_STATES.RETURN) speed *= 0.6;

    if (this.fsm.currentState !== DOG_STATES.IDLE && this.fsm.currentState !== DOG_STATES.DEAD) {
      const steerDir = this.pathfinding.getSteeredDirection(this.position, this.forward, this.tacticalTargetPos);

      this.velocity.x = steerDir.x * speed;
      this.velocity.z = steerDir.z * speed;

      this.position.x += this.velocity.x * delta;
      this.position.z += this.velocity.z * delta;

      // Rotate toward movement direction
      const targetAngle = Math.atan2(steerDir.x, steerDir.z);
      this.rotationAngle = lerp(this.rotationAngle, targetAngle, delta * 10.0);
      this.meshGroup.rotation.y = this.rotationAngle;
      this.forward.set(Math.sin(this.rotationAngle), 0, Math.cos(this.rotationAngle));

      // Resolve world collisions
      if (this.collisionSystem) {
        this.collisionSystem.resolveCapsuleCollision(this.position, 0.45, 0.8);
      }

      this.meshGroup.position.copy(this.position);
    }

    // Animate quadruped leg joints
    this.animateLegs(delta, speed);
  }

  animateLegs(delta, speed) {
    if (!this.joints || !this.joints.frontLeft) return;

    const isMoving = this.velocity.lengthSq() > 0.1;
    const animTime = performance.now() * 0.012 * (speed / 5.0);
    const swing = isMoving ? Math.sin(animTime) * 0.5 : 0;

    // Diagonal leg gait (Front Left + Back Right pair; Front Right + Back Left pair)
    this.joints.frontLeft.rotation.x = swing;
    this.joints.backRight.rotation.x = swing;
    this.joints.frontRight.rotation.x = -swing;
    this.joints.backLeft.rotation.x = -swing;

    // Head bobbing & Tail wagging
    if (this.joints.head && isMoving) {
      this.joints.head.rotation.x = Math.sin(animTime * 2.0) * 0.08;
    }

    if (this.joints.tail) {
      const tailWagSpeed = (this.fsm.currentState === DOG_STATES.CHASE || this.fsm.currentState === DOG_STATES.ATTACK) ? 4.0 : 2.0;
      this.joints.tail.rotation.y = Math.sin(performance.now() * 0.01 * tailWagSpeed) * 0.35;
    }
  }
}
