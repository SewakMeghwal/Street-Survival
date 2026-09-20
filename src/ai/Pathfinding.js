import * as THREE from 'three';

/**
 * Pathfinding.js
 * Raycast whisker sensor steering system.
 * Allows enemy dog AI to navigate smoothly around buildings, cars, and obstacles
 * without clipping or getting stuck in corners.
 */

export class Pathfinding {
  constructor(collisionSystem) {
    this.collisionSystem = collisionSystem;
  }

  /**
   * Calculates a steering direction vector toward targetPos while avoiding obstacles using whiskers
   */
  getSteeredDirection(currentPos, forwardDir, targetPos) {
    const desiredDir = new THREE.Vector3().subVectors(targetPos, currentPos);
    desiredDir.y = 0;
    desiredDir.normalize();

    if (!this.collisionSystem) return desiredDir;

    // Whisker sensor setup (Center, Left 35 deg, Right 35 deg)
    const whiskers = [
      desiredDir.clone(),
      desiredDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * 0.2),
      desiredDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI * 0.2)
    ];

    const sensorLength = 3.5;
    let pushVector = new THREE.Vector3();

    whiskers.forEach((wDir, idx) => {
      const hitDist = this.collisionSystem.raycastObstacle(currentPos, wDir, sensorLength);
      if (hitDist !== null) {
        const repulseFactor = (sensorLength - hitDist) / sensorLength;
        // Apply steering force away from hit wall
        const sideDir = wDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), idx === 1 ? -Math.PI * 0.5 : Math.PI * 0.5);
        pushVector.addScaledVector(sideDir, repulseFactor * 2.5);
      }
    });

    const finalDir = desiredDir.add(pushVector).normalize();
    return finalDir;
  }
}
