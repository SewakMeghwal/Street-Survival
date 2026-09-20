/**
 * SaveSystem.js
 * LocalStorage save state manager. Designed so it can be swapped with a REST API call
 * to Django/DRF endpoints (POST /api/progress/, GET /api/profile/) in the future.
 */

const SAVE_KEY = 'street_survival_save_v1';

const DEFAULT_SAVE = {
  unlockedMissions: [1],
  completedMissions: [],
  selectedCharacter: 'male', // 'male' or 'female'
  settings: {
    volume: 0.7,
    graphics: 'high',
    debug: false
  }
};

export class SaveSystem {
  static load() {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      if (data) {
        return { ...DEFAULT_SAVE, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Could not read save data from localStorage.', e);
    }
    return { ...DEFAULT_SAVE };
  }

  static save(data) {
    try {
      const current = this.load();
      const updated = { ...current, ...data };
      localStorage.setItem(SAVE_KEY, JSON.stringify(updated));
      return true;
    } catch (e) {
      console.warn('Could not write save data to localStorage.', e);
      return false;
    }
  }

  static unlockMission(missionId) {
    const data = this.load();
    if (!data.unlockedMissions.includes(missionId)) {
      data.unlockedMissions.push(missionId);
      this.save(data);
    }
  }

  static completeMission(missionId) {
    const data = this.load();
    if (!data.completedMissions.includes(missionId)) {
      data.completedMissions.push(missionId);
    }
    const nextMission = missionId + 1;
    if (!data.unlockedMissions.includes(nextMission)) {
      data.unlockedMissions.push(nextMission);
    }
    this.save(data);
  }
}
