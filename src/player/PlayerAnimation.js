import * as THREE from 'three';

/**
 * PlayerAnimation.js
 * Articulated limb animation mixer.
 * Controls 2-segment arms (Upper Arm + Forearm) and 2-segment legs (Thigh + Shin)
 * with natural shoulder bobbing, forward stride lean, and idle breathing.
 */

export class PlayerAnimation {
  constructor(playerJoints) {
    this.joints = playerJoints;
    this.animTime = 0;
    this.state = 'IDLE';
  }

  setState(newState) {
    if (this.state === newState) return;
    this.state = newState;
  }

  update(delta, speed, isGrounded) {
    this.animTime += delta * (speed > 0 ? speed * 2.5 : 1.5);

    if (!this.joints) return;

    const {
      leftArm, leftForearm,
      rightArm, rightForearm,
      leftLeg, leftShin,
      rightLeg, rightShin,
      head
    } = this.joints;

    if (this.state === 'DEAD') {
      leftArm.rotation.set(0, 0, 0);
      rightArm.rotation.set(0, 0, 0);
      leftLeg.rotation.set(0, 0, 0);
      rightLeg.rotation.set(0, 0, 0);
      return;
    }

    if (!isGrounded || this.state === 'JUMP') {
      // Jump pose
      leftArm.rotation.x = -Math.PI * 0.6;
      rightArm.rotation.x = -Math.PI * 0.6;
      leftLeg.rotation.x = Math.PI * 0.25;
      rightLeg.rotation.x = -Math.PI * 0.25;
      if (leftShin) leftShin.rotation.x = Math.PI * 0.3;
      if (rightShin) rightShin.rotation.x = 0;
      return;
    }

    if (speed > 0.2) {
      // Natural Run Cycle
      const strideFreq = 3.5;
      const swing = Math.sin(this.animTime * strideFreq) * Math.min(1.1, speed * 0.16);

      // Arms swing opposite to legs
      leftArm.rotation.x = swing;
      rightArm.rotation.x = -swing;

      // Elbows bent naturally during run
      if (leftForearm) leftForearm.rotation.x = -Math.PI * 0.35 + Math.sin(this.animTime * strideFreq) * 0.2;
      if (rightForearm) rightForearm.rotation.x = -Math.PI * 0.35 - Math.sin(this.animTime * strideFreq) * 0.2;

      // Legs swing
      leftLeg.rotation.x = -swing * 1.1;
      rightLeg.rotation.x = swing * 1.1;

      // Knee bend on back swing
      if (leftShin) leftShin.rotation.x = swing < 0 ? -swing * 0.9 : 0;
      if (rightShin) rightShin.rotation.x = swing > 0 ? swing * 0.9 : 0;

      if (head) {
        head.rotation.y = Math.sin(this.animTime * strideFreq * 0.5) * 0.06;
      }
    } else {
      // Idle Breathing Cycle
      const breathe = Math.sin(this.animTime * 1.8) * 0.04;

      leftArm.rotation.x = breathe;
      rightArm.rotation.x = -breathe;
      if (leftForearm) leftForearm.rotation.x = -0.1;
      if (rightForearm) rightForearm.rotation.x = -0.1;

      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      if (leftShin) leftShin.rotation.x = 0;
      if (rightShin) rightShin.rotation.x = 0;

      if (head) {
        head.rotation.y = Math.sin(this.animTime * 0.8) * 0.05;
      }
    }
  }
}
