import * as THREE from 'three';

/**
 * MathUtils.js
 * High-performance math helpers, angle calculations, vector pooling, and bounding utilities.
 */

// Reusable vector pool to avoid GC allocations in hot loops
const VECTOR_POOL = Array.from({ length: 32 }, () => new THREE.Vector3());
let poolIndex = 0;

export function getTempVector() {
  const v = VECTOR_POOL[poolIndex];
  poolIndex = (poolIndex + 1) % VECTOR_POOL.length;
  return v.set(0, 0, 0);
}

export function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function angleDifference(a, b) {
  let diff = (b - a) % (Math.PI * 2);
  if (diff < -Math.PI) diff += Math.PI * 2;
  if (diff > Math.PI) diff -= Math.PI * 2;
  return diff;
}

export function distanceXZ(posA, posB) {
  const dx = posA.x - posB.x;
  const dz = posA.z - posB.z;
  return Math.sqrt(dx * dx + dz * dz);
}

export function distanceXZSq(posA, posB) {
  const dx = posA.x - posB.x;
  const dz = posA.z - posB.z;
  return dx * dx + dz * dz;
}

/**
 * Check if target is inside vision cone of observer
 */
export function isInVisionCone(observerPos, observerForward, targetPos, fovRadians, maxDistance) {
  const distSq = distanceXZSq(observerPos, targetPos);
  if (distSq > maxDistance * maxDistance) return false;

  const toTarget = getTempVector().subVectors(targetPos, observerPos);
  toTarget.y = 0;
  toTarget.normalize();

  const dot = observerForward.x * toTarget.x + observerForward.z * toTarget.z;
  const cosFov = Math.cos(fovRadians * 0.5);
  return dot >= cosFov;
}
