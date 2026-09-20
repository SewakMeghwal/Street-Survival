/**
 * DogStateMachine.js
 * Dog Behavioral Finite State Machine.
 * States: IDLE, PATROL, NOTICE_PLAYER, CHASE, FLANK, SURROUND, ATTACK, SEARCH, LOSE_PLAYER, RETURN, DEAD
 */

export const DOG_STATES = {
  IDLE: 'IDLE',
  PATROL: 'PATROL',
  NOTICE_PLAYER: 'NOTICE_PLAYER',
  CHASE: 'CHASE',
  FLANK: 'FLANK',
  SURROUND: 'SURROUND',
  ATTACK: 'ATTACK',
  SEARCH: 'SEARCH',
  LOSE_PLAYER: 'LOSE_PLAYER',
  RETURN: 'RETURN',
  DEAD: 'DEAD'
};

export class DogStateMachine {
  constructor(dog) {
    this.dog = dog;
    this.currentState = DOG_STATES.IDLE;
    this.stateTimer = 0;
  }

  changeState(newState) {
    if (this.currentState === newState || this.currentState === DOG_STATES.DEAD) return;
    this.currentState = newState;
    this.stateTimer = 0;
  }

  update(delta) {
    this.stateTimer += delta;
  }
}
