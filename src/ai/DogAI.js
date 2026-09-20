import * as THREE from 'three';
import { distanceXZ, isInVisionCone } from '../utils/MathUtils.js';

/**
 * DogAI.js
 * Dog perception system: Vision cone detection, sound hearing range,
 * line-of-sight raycasts, and target prediction logic.
 */

export class DogAI {
  constructor(dog, collisionSystem) {
    this.dog = dog;
    this.collisionSystem = collisionSystem;
    this.lastKnownPlayerPos = new THREE.Vector3();
    this.hasLineOfSight = false;
  }

  canSeePlayer(player) {
    if (!player || player.stats.health <= 0) return false;

    const dogPos = this.dog.position;
    const playerPos = player.position;

    const dist = distanceXZ(dogPos, playerPos);
    if (dist > this.dog.config.noticeRadius) return false;

    // Check vision cone (120 degree fov)
    const inCone = isInVisionCone(
      dogPos,
      this.dog.forward,
      playerPos,
      Math.PI * 0.66,
      this.dog.config.noticeRadius
    );

    // Close proximity hearing check (dogs hear player running/sprinting even if behind)
    const playerIsRunning = player.velocity.lengthSq() > 15.0;
    const isCloseEnough = dist < 7.0;

    if (!inCone && !(playerIsRunning && isCloseEnough)) return false;

    // Line of Sight Raycast check
    if (this.collisionSystem) {
      const rayDir = new THREE.Vector3().subVectors(playerPos, dogPos).normalize();
      const hitDist = this.collisionSystem.raycastObstacle(dogPos, rayDir, dist);
      if (hitDist !== null && hitDist < dist - 0.5) {
        this.hasLineOfSight = false;
        return false;
      }
    }

    this.hasLineOfSight = true;
    this.lastKnownPlayerPos.copy(playerPos);
    return true;
  }

  /**
   * Predicts where the player will be in `leadTime` seconds based on player velocity
   */
  getPredictedPlayerPos(player, leadTime = 1.5) {
    const predicted = player.position.clone();
    predicted.x += player.velocity.x * leadTime;
    predicted.z += player.velocity.z * leadTime;
    return predicted;
  }
}
