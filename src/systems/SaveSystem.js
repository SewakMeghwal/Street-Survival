/**
 * SaveSystem.js
 * LocalStorage save state manager with user account auth & personal milestones.
 * Django REST Framework API ready (`POST /api/auth/login/`, `GET /api/profile/`).
 */

const SAVE_KEY = 'street_survival_save_v2';

const DEFAULT_SAVE = {
  unlockedMissions: [1],
  completedMissions: [],
  selectedCharacter: 'male',
  user: {
    username: 'Guest Survivor',
    isGuest: true,
    token: null
  },
  milestones: {
    totalSurvivalTime: 0,
    dogsEvaded: 0,
    completedMissions: []
  },
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

  static getCurrentUser() {
    return this.load().user || DEFAULT_SAVE.user;
  }

  static setUser(userData) {
    const data = this.load();
    data.user = { ...data.user, ...userData };
    this.save(data);
    return data.user;
  }

  static logoutUser() {
    const data = this.load();
    data.user = { username: 'Guest Survivor', isGuest: true, token: null };
    this.save(data);
  }

  static getMilestones() {
    const data = this.load();
    return data.milestones || DEFAULT_SAVE.milestones;
  }

  static addSurvivalTime(seconds) {
    const data = this.load();
    data.milestones.totalSurvivalTime = (data.milestones.totalSurvivalTime || 0) + seconds;
    this.save(data);
  }

  static addDogEvaded() {
    const data = this.load();
    data.milestones.dogsEvaded = (data.milestones.dogsEvaded || 0) + 1;
    this.save(data);
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
    if (!data.milestones.completedMissions.includes(missionId)) {
      data.milestones.completedMissions.push(missionId);
    }
    const nextMission = missionId + 1;
    if (!data.unlockedMissions.includes(nextMission)) {
      data.unlockedMissions.push(nextMission);
    }
    this.save(data);
  }
}
