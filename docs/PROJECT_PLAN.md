# VERTA — MVP Project Plan

## Overview

Build the foundational version of VERTA using **Three.js + TypeScript + Vite**, demonstrating the core gameplay loop (fight → gain XP → level up → climb) with minimalist geometric visuals.

### Key Decisions

| Aspect | Decision |
|--------|----------|
| **Tech Stack** | Three.js + TypeScript + Vite |
| **Camera** | Isometric (OrthographicCamera at 45°) |
| **Movement** | Screen-relative WASD |
| **Attack (MVP)** | Area pulse |
| **HUD** | HTML/CSS overlay |
| **Architecture** | Simple class-based (no full ECS for now) |

---

## Steps

### Step 1: Set Up Project Foundation
**Status:** ✅ Complete

Initialize Vite + TypeScript + Three.js with post-processing (UnrealBloomPass), configure isometric OrthographicCamera at 45° angle, render a test cube to confirm setup.

**Files:**
- [x] `package.json` — Dependencies: three, @types/three, vite, typescript
- [x] `tsconfig.json` — TypeScript config with strict mode, ES modules
- [x] `vite.config.ts` — Vite config (minimal)
- [x] `index.html` — Entry HTML with full-viewport canvas
- [x] `src/main.ts` — Entry point, bootstrap game
- [x] `src/Game.ts` — Main game class with render loop
- [x] `src/rendering/Renderer.ts` — WebGLRenderer + EffectComposer with UnrealBloomPass
- [x] `src/rendering/Camera.ts` — Isometric OrthographicCamera setup

**Result:** ✅ Glowing cyan test cube rendered from isometric perspective with bloom effect. Dev server running at http://localhost:5173/

---

### Step 2: Implement Player Entity
**Status:** ✅ Complete

Create geometric player (octahedron) with screen-relative WASD movement, emissive glow material, thin `InputManager` class.

**Files:**
- [x] `src/entities/Player.ts` — Player class with mesh and movement logic
- [x] `src/input/InputManager.ts` — Keyboard input handling

**Result:** ✅ Controllable glowing octahedron that moves with WASD in screen-relative directions, with subtle rotation animation.

---

### Step 3: Build Arena Level
**Status:** ✅ Complete

Single rectangular platform with grid floor, dark background, bloom lighting, positioned for isometric viewing.

**Files:**
- [x] `src/levels/Arena.ts` — Arena geometry with floor, grid, glowing edges, corner accents, and bounds

**Result:** ✅ Player confined to a 24x24 arena with visible grid, glowing cyan edges, and corner accents.

---

### Step 4: Add Enemies with Basic AI
**Status:** ✅ Complete

Spawn 2-3 geometric shapes (cubes/tetrahedrons) with simple chase behavior toward the player.

**Files:**
- [x] `src/entities/Enemy.ts` — Enemy class with mesh, chaser/wanderer behaviors
- [x] `src/systems/EnemySpawner.ts` — Spawn logic with player distance checking

**Result:** ✅ 3 enemies spawn (alternating chasers and wanderers), chase/wander toward player, stay within arena bounds.

---

### Step 5: Implement Combat System
**Status:** ✅ Complete

Area pulse attack with abstract `Weapon` interface for future types (ranged, melee, aura). Auto-attack system based on cooldowns. Enemy health, damage, death effects, collision detection.

**Files:**
- [x] `src/combat/Weapon.ts` — Abstract weapon interface with cooldown system
- [x] `src/combat/AreaPulse.ts` — Area pulse auto-attack implementation
- [x] `src/combat/CombatSystem.ts` — Damage calculation, hit detection, death animations
- [x] `src/entities/PlayerStats.ts` — Player stats (damage, attack rate, health, etc.)

**Result:** ✅ Player auto-attacks every 1 second with expanding cyan pulse. Enemies in range die with flash + shrink animation. Attack rate is upgradeable via player stats.

---

### Step 6: Create XP/Progression System
**Status:** 🔄 Next Up

HTML/CSS overlay HUD showing XP, level, health. Stat increases on level-up with visual feedback.

**Files:**
- [ ] `src/ui/HUD.ts` — HUD management
- [ ] `src/systems/ProgressionSystem.ts` — XP tracking, level-up logic
- [ ] `src/styles/hud.css` — HUD styling

**Expected Result:** HUD displays stats, XP increases when enemies die, level-up triggers stat boost.

---

### Step 7: Wire Vertical Progression Loop
**Status:** ⏳ Not Started

"Level complete" trigger when enemies cleared, camera transition upward, spawn new arena with scaled enemies.

**Files:**
- [ ] `src/levels/LevelManager.ts` — Level state, transitions, enemy scaling

**Expected Result:** Clearing all enemies triggers transition to next level with stronger enemies.

---

## Future Considerations (Post-MVP)

- [ ] Multiple weapon types (ranged, melee, aura)
- [ ] Procedural level generation
- [ ] Mini-bosses and final boss
- [ ] Sound/music
- [ ] Mobile/gamepad input
- [ ] Save system
