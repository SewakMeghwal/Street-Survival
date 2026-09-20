import { SaveSystem } from '../systems/SaveSystem.js';

/**
 * MainMenu.js
 * Manages Title screen, Character selection (Male / Female), Mission selection grid, and Settings.
 */

export class MainMenu {
  constructor(game) {
    this.game = game;
    this.screen = document.getElementById('main-menu');
    this.charScreen = document.getElementById('char-menu');
    this.missionScreen = document.getElementById('mission-menu');

    this.selectedGender = 'male';

    this.initButtons();
  }

  initButtons() {
    // Play button
    document.getElementById('btn-start')?.addEventListener('click', () => {
      this.game.startMission(1);
    });

    // Character Selection button
    const charBtn = document.getElementById('btn-char-select');
    charBtn?.addEventListener('click', () => {
      this.showScreen('char-menu');
    });

    // Male / Female cards
    const maleCard = document.getElementById('char-male');
    const femaleCard = document.getElementById('char-female');

    maleCard?.addEventListener('click', () => {
      this.selectedGender = 'male';
      maleCard.classList.add('selected');
      femaleCard?.classList.remove('selected');
      if (charBtn) charBtn.textContent = 'CHARACTER: MALE';
      this.game.player.setGender('male');
      SaveSystem.save({ selectedCharacter: 'male' });
    });

    femaleCard?.addEventListener('click', () => {
      this.selectedGender = 'female';
      femaleCard.classList.add('selected');
      maleCard?.classList.remove('selected');
      if (charBtn) charBtn.textContent = 'CHARACTER: FEMALE';
      this.game.player.setGender('female');
      SaveSystem.save({ selectedCharacter: 'female' });
    });

    document.getElementById('btn-char-back')?.addEventListener('click', () => {
      this.showScreen('main-menu');
    });

    // Mission Select button
    document.getElementById('btn-mission-select')?.addEventListener('click', () => {
      this.populateMissionList();
      this.showScreen('mission-menu');
    });

    document.getElementById('btn-mission-back')?.addEventListener('click', () => {
      this.showScreen('main-menu');
    });
  }

  populateMissionList() {
    const listContainer = document.getElementById('mission-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    const saveData = SaveSystem.load();

    this.game.missionManager.missions.forEach(m => {
      const isUnlocked = saveData.unlockedMissions.includes(m.id);
      const btn = document.createElement('button');
      btn.className = `btn ${isUnlocked ? '' : 'btn-secondary'}`;
      btn.style.textAlign = 'left';
      btn.style.display = 'flex';
      btn.style.justifyContent = 'space-between';

      btn.innerHTML = `
        <span>${m.title}</span>
        <span>${isUnlocked ? (saveData.completedMissions.includes(m.id) ? '✓ COMPLETED' : 'UNLOCKED') : '🔒 LOCKED'}</span>
      `;

      if (isUnlocked) {
        btn.onclick = () => {
          this.game.startMission(m.id);
        };
      } else {
        btn.disabled = true;
        btn.style.opacity = '0.5';
      }

      listContainer.appendChild(btn);
    });
  }

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => {
      if (s.id === screenId) {
        s.classList.remove('hidden');
        s.classList.add('active');
      } else {
        s.classList.add('hidden');
        s.classList.remove('active');
      }
    });
  }
}
