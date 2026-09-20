/**
 * GameState.js
 * Central game lifecycle state machine.
 */

export const GAME_STATES = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAMEOVER: 'GAMEOVER',
  VICTORY: 'VICTORY'
};

export class GameState {
  constructor(initialState = GAME_STATES.MENU) {
    this.current = initialState;
    this.listeners = [];
  }

  set(newState) {
    if (this.current === newState) return;
    const oldState = this.current;
    this.current = newState;
    this.listeners.forEach(fn => fn(newState, oldState));
  }

  is(state) {
    return this.current === state;
  }

  onChange(fn) {
    this.listeners.push(fn);
  }
}
