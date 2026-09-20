import * as THREE from 'three';
import { Dog } from './Dog.js';
import { DOG_STATES } from './DogStateMachine.js';

/**
 * DogManager.js
 * Tactical pack coordinator.
 * Prevents all dogs from crowding onto the exact same position by assigning tactical roles
 * (Direct Chase, Flank Left, Flank Right, Interceptor) dynamically.
 */

export class DogManager {
  constructor(scene, collisionSystem) {
    this.scene = scene;
    this.collisionSystem = collisionSystem;
    this.dogs = [];
  }

  clear() {
    this.dogs.forEach(d => d.destroy());
    this.dogs = [];
  }

  spawnDog(typeConfig, spawnPos) {
    const dog = new Dog(this.scene, typeConfig, spawnPos, this.collisionSystem);
    this.dogs.push(dog);
    return dog;
  }

  update(delta, player, safeZones) {
    // Check if player is inside any active safe zone
    let inSafeZone = false;
    if (safeZones && player) {
      inSafeZone = safeZones.isPositionInSafeZone(player.position);
    }

    // Identify active chasing dogs
    const chasingDogs = this.dogs.filter(
      d => d.fsm.currentState === DOG_STATES.CHASE || d.fsm.currentState === DOG_STATES.ATTACK
    );

    // Assign tactical pack roles dynamically
    if (player && chasingDogs.length > 0) {
      const playerPos = player.position;
      const playerVel = player.velocity.clone().normalize();

      chasingDogs.forEach((dog, index) => {
        const roleIndex = index % 4;

        if (roleIndex === 0) {
          // Direct Chase
          dog.tacticalRole = 'CHASE';
          dog.tacticalTargetPos.copy(playerPos);
        } else if (roleIndex === 1) {
          // Flank Left (Offset 45 deg left of player velocity)
          dog.tacticalRole = 'FLANK_LEFT';
          const offset = playerVel.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * 0.25).multiplyScalar(4.0);
          dog.tacticalTargetPos.copy(playerPos).add(offset);
        } else if (roleIndex === 2) {
          // Flank Right (Offset 45 deg right of player velocity)
          dog.tacticalRole = 'FLANK_RIGHT';
          const offset = playerVel.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI * 0.25).multiplyScalar(4.0);
          dog.tacticalTargetPos.copy(playerPos).add(offset);
        } else {
          // Interceptor (Predict player movement 2.5s ahead)
          dog.tacticalRole = 'INTERCEPT';
          const predicted = dog.ai.getPredictedPlayerPos(player, 2.5);
          dog.tacticalTargetPos.copy(predicted);
        }
      });
    }

    // Update each dog AI
    this.dogs.forEach(dog => dog.update(delta, player, inSafeZone));
  }

  getNearestDogDistance(playerPos) {
    let minSquare = Infinity;
    this.dogs.forEach(dog => {
      if (dog.fsm.currentState !== DOG_STATES.DEAD) {
        const distSq = dog.position.distanceToSquared(playerPos);
        if (distSq < minSquare) minSquare = distSq;
      }
    });
    return Math.sqrt(minSquare);
  }
}
