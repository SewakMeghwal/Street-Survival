# 🐕 Street Survival - 3D Third-Person WebGL Survival Game

> **Street Survival** is a browser-based 3D third-person survival chase game powered by **Three.js** and **WebGL**. Set in the urban neighborhood of **Survival Nagar** (North India), players must run, evade, and survive against aggressive packs of stray dogs using sprint management, environmental obstacles, and safe zones across 5 tactical missions.

---

## 🎮 Features

- **Polished Third-Person Camera**: Collision-aware follow camera with smooth lerping, pitch bounds, mouse look, and raycast obstacle prevention to stop clipping through walls.
- **Player Stats & Mechanics**: Health (100 HP), Stamina (100 SP) with sprint consumption, walking recovery, exhaustion penalty, jump physics, and crouching.
- **Character Selection**: Play as **Raj (Male)** or **Priya (Female)** with custom low-poly rigged models and color accents.
- **Advanced Tactical Dog AI**:
  - **11-State Behavioral FSM**: `IDLE`, `PATROL`, `NOTICE_PLAYER`, `CHASE`, `FLANK`, `SURROUND`, `ATTACK`, `SEARCH`, `LOSE_PLAYER`, `RETURN`, `DEAD`.
  - **4 Configurable Dog Breeds**: Stray Dog, Hound (Fast), Mastiff (Heavy), and Alpha Dog (Leader).
  - **Pack Tactics (`DogManager`)**: Coordinates pack roles dynamically (Direct Chase, Flank Left, Flank Right, Interceptor) so dogs don't crowd identical paths.
  - **Whisker Sensor Steering**: Raycast whisker sensors avoid buildings and corner traps.
- **Survival Nagar (8 Gameplay Zones)**:
  1. *Zone 1*: Residential Streets with Indian-style 2-3 story houses and balconies.
  2. *Zone 2*: Market Alley with vendor stalls and produce crates.
  3. *Zone 3*: Central Park with grass lawns, trees, and benches.
  4. *Zone 4*: Construction Area with barricades and concrete blocks.
  5. *Zone 5*: Industrial Sheds with corrugated roofs and storage.
  6. *Zone 6*: Main Avenue with auto-rickshaws, sedan cars, and street lamps.
  7. *Zone 7*: Dark Dog Alleyways.
  8. *Zone 8*: Glowing Green Safe Zones (Safe House, Police Booth, Community Gate).
- **5 Survival Missions**:
  - **Mission 1: GET HOME** (Reach Safe House, 2 stray dogs).
  - **Mission 2: THE ALLEY** (Cross market alley to Police Booth, 3 mixed dogs).
  - **Mission 3: TRAPPED** (Survive 2 minutes in central plaza against dog waves).
  - **Mission 4: THE PACK** (Escape to Industrial Warehouse hunted by an Alpha Pack).
  - **Mission 5: NIGHT RUN** (Nocturnal survival run through rain and active street lamps).
- **Dynamic Day/Night & Weather Systems**: Smooth sun light cycle, ambient transitions, street lamp glow at night, and particle rain.
- **Zero-Dependency Procedural Web Audio API SFX**: Synthesizes realistic dog barks, growls, footsteps, damage hits, jump sounds, and victory jingles out of the box.
- **Developer Debug Tools**: Press `F3` or `` ` `` to toggle real-time FPS, player coordinates, active dog count, and AI states.

---

## 🛠️ Technology Stack

- **Graphics & Engine**: Three.js (WebGL), HTML5 Canvas
- **Tooling & Bundler**: Vite (ES Modules)
- **Language**: JavaScript (ES2023+)
- **Audio Engine**: Web Audio API (Procedural Synthesizer + AudioBuffer fallback)
- **Physics & Collision**: Custom Spatial AABB & Capsule Collision System

---

## 📁 Project Structure

```text
street-survival/
│
├── public/
│   ├── assets/
│   │   ├── models/
│   │   │   ├── player/
│   │   │   ├── dogs/
│   │   │   ├── buildings/
│   │   │   ├── vehicles/
│   │   │   └── props/
│   │   ├── textures/
│   │   └── audio/
│   └── favicon.ico
│
├── src/
│   ├── main.js                 # Application entry point
│   │
│   ├── game/
│   │   ├── Game.js             # Master WebGL engine orchestrator
│   │   ├── GameState.js        # Global lifecycle state machine
│   │   ├── GameLoop.js         # Fixed delta-time RAF loop
│   │   └── GameConfig.js       # Central stats & constants configuration
│   │
│   ├── player/
│   │   ├── Player.js           # Main Player entity
│   │   ├── PlayerController.js # WASD, Shift, Space, Crouch & Gamepad handler
│   │   ├── PlayerAnimation.js  # Limb cycle & state animator
│   │   ├── PlayerStats.js      # Health, Stamina, Invulnerability window
│   │   └── PlayerCollision.js  # Capsule vs World collision resolution
│   │
│   ├── ai/
│   │   ├── Dog.js              # Dog enemy entity
│   │   ├── DogAI.js            # Perception, vision cone, line-of-sight
│   │   ├── DogManager.js       # Pack tactical role assignment coordinator
│   │   ├── DogStateMachine.js  # Dog behavioral state machine
│   │   └── Pathfinding.js      # Whisker sensor steering obstacle avoidance
│   │
│   ├── world/
│   │   ├── City.js             # Master environment manager
│   │   ├── RoadSystem.js       # Asphalt streets & street lamps
│   │   ├── Buildings.js        # Residential houses & warehouses
│   │   ├── Trees.js            # Instanced park trees & foliage
│   │   ├── Vehicles.js         # Auto-rickshaws & parked cars
│   │   ├── Props.js            # Market stalls, benches, crates
│   │   ├── SafeZones.js        # Safe house & police booth rings
│   │   └── WorldChunk.js       # Spatial chunk grid culling
│   │
│   ├── missions/
│   │   ├── MissionManager.js   # Active mission tracker & wave evaluator
│   │   └── Mission.js          # Mission configuration schema
│   │
│   ├── systems/
│   │   ├── CollisionSystem.js  # Fast AABB & Capsule spatial grid collision
│   │   ├── AudioSystem.js      # Web Audio API sound synthesizer
│   │   ├── WeatherSystem.js    # Particle rain & fog
│   │   ├── DayNightSystem.js   # Sunlight, sky color, street lamp igniter
│   │   ├── ParticleSystem.js   # Hit & dust particle manager
│   │   └── SaveSystem.js       # LocalStorage wrapper (Django REST API ready)
│   │
│   ├── camera/
│   │   └── ThirdPersonCamera.js# Collision-aware follow camera
│   │
│   ├── ui/
│   │   ├── HUD.js              # Health, Stamina, Objective, Danger Radar UI
│   │   ├── MainMenu.js         # Title screen, Character select, Mission list
│   │   ├── PauseMenu.js        # Pause overlay
│   │   ├── GameOverUI.js       # Defeat & Victory summary screens
│   │   ├── DebugUI.js          # FPS & AI state debug overlay
│   │   └── UIManager.js        # Screen transition coordinator
│   │
│   └── utils/
│       ├── AssetLoader.js      # GLTF/Texture loader with caching & fallbacks
│       ├── MathUtils.js        # Vector pooling & geometric functions
│       ├── PerformanceMonitor.js # FPS / Draw Call monitor
│       └── ProceduralMeshFactory.js # Dynamic 3D model generator
│
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Installation & Commands

### Prerequisites
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
Launches local Vite dev server with hot module replacement (HMR):
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 3. Production Build
Bundles and minifies the application into the `dist/` directory:
```bash
npm run build
```

### 4. Preview Build
Locally preview the production build:
```bash
npm run preview
```

---

## 🎨 Asset Integration Guide

### How to Add `.glb` / `.gltf` 3D Models
1. Place your `.glb` model files into `public/assets/models/<category>/` (e.g. `public/assets/models/player/survivor.glb`).
2. Use `AssetLoader` inside `AssetLoader.js` to asynchronously load the file:
```javascript
const model = await game.assetLoader.loadModel('/assets/models/player/survivor.glb');
if (model) {
  scene.add(model);
}
```
3. If the `.glb` model is not present, `ProceduralMeshFactory` automatically provides stylized 3D low-poly procedural fallback models.

### How to Add Skeleton / GLTF Animations
`AssetLoader` returns standard `gltf.animations`. Bind them using Three.js `AnimationMixer`:
```javascript
const mixer = new THREE.AnimationMixer(gltfModel);
const action = mixer.clipAction(gltf.animations[0]);
action.play();
```

---

## 🧠 How Dog AI & Pack Tactics Work

1. **Perception**: Each dog updates vision cone checks (120° FOV) and hearing proximity radius. Raycasts ensure solid walls block line of sight.
2. **Pack Intelligence (`DogManager`)**: When multiple dogs chase the player, `DogManager` assigns tactical roles:
   - **Dog 1 (Direct Chase)**: Runs straight at player position.
   - **Dog 2 (Flank Left)**: Targets position offset 45° to player's left.
   - **Dog 3 (Flank Right)**: Targets position offset 45° to player's right.
   - **Dog 4 (Interceptor)**: Predicts player position 2.5 seconds ahead using velocity vectors.
3. **Obstacle Whisker Steering**: Whiskers cast ray sensors ahead to steer around corners and buildings smoothly.
4. **Safe Zone Disengagement**: Dogs immediately disengage chase and enter `RETURN` state if the player reaches a safe zone.

---

## 📜 How to Create Custom Missions

Missions are defined in `src/missions/MissionManager.js`. Add a new `Mission` object to `this.missions`:

```javascript
new Mission({
  id: 6,
  title: 'MISSION 6: MARKET SURVIVAL',
  description: 'Reach the Market Safe Zone under heavy dog pursuit.',
  playerSpawn: new THREE.Vector3(-80, 0, -80),
  safeZonePos: new THREE.Vector3(65, 0, 65),
  safeZoneRadius: 10.0,
  isNight: true,
  weather: 'RAIN',
  dogSpawns: [
    { type: 'LEADER', pos: new THREE.Vector3(-40, 0, -40) },
    { type: 'HEAVY', pos: new THREE.Vector3(0, 0, 0) },
    { type: 'FAST', pos: new THREE.Vector3(40, 0, 40) }
  ]
})
```

---

## ⚡ Performance Recommendations

- **Vector Pooling**: Use `getTempVector()` from `src/utils/MathUtils.js` in hot loops to eliminate garbage collection pauses.
- **Instanced Mesh**: Repeated objects (street lights, trees) use instanced rendering to maintain 60 FPS on desktop PCs.
- **Spatial Collision Filtering**: `CollisionSystem` uses height and AABB distance checks before running fine-grained cylinder intersections.

---

## 🔌 Future Django / REST API Integration

`SaveSystem.js` is structured for seamless integration with a Django REST Framework (DRF) backend:

| Local Method | Target Django Endpoint | Description |
|---|---|---|
| `SaveSystem.load()` | `GET /api/profile/` | Fetch player unlocked missions & stats |
| `SaveSystem.completeMission(id)` | `POST /api/progress/` | Submit completed mission log & score |
| Future Auth | `POST /api/auth/login/` | Player account login |

---

## 📜 License & Credits

- **Game Concept**: Street Survival
- **Author**: Antigravity AI Engineering
- **Engine**: Three.js + WebGL
