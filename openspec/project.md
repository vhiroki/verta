# Project Context

## Purpose

VERTA is a minimalist 3D roguelike browser game where the player climbs an abstract geometric structure, fighting enemies to gain XP and level up until reaching the apex or dying.

**Goals:**
- Deliver a clean, focused, intense roguelike experience
- Use abstract/geometric visuals with no realistic or narrative elements
- Run efficiently in the browser via WebGL
- Single-run gameplay with permanent death and escalating difficulty

**Narrative Framing:**
- VERTA is a self-defending system; the player is an anomaly it cannot resolve
- Enemies are "defensive constructs" — system functions that enforce integrity
- Progression represents deeper system penetration through layers/states
- The final boss is the Core Logic — VERTA's deepest enforcement mechanism

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Three.js | ^0.169.0 | 3D rendering, WebGL |
| TypeScript | ^5.6.0 | Type-safe development |
| Vite | ^6.0.0 | Dev server & bundling |

**Key Libraries:**
- `three/addons/postprocessing/` — UnrealBloomPass, EffectComposer
- HTML/CSS overlay for HUD (no Three.js UI)

## Project Structure

```
src/
├── main.ts              # Entry point - bootstraps Game
├── Game.ts              # Main game loop, orchestrates all systems
├── combat/
│   ├── Weapon.ts        # Abstract weapon interface
│   ├── AreaPulse.ts     # Expanding ring auto-attack implementation
│   └── CombatSystem.ts  # Hit detection, damage, death animations
├── entities/
│   ├── Player.ts        # Player octahedron with WASD movement
│   ├── Enemy.ts         # Enemy shapes (chaser/wanderer behaviors)
│   └── PlayerStats.ts   # Stats interface & XP calculations
├── input/
│   └── InputManager.ts  # Keyboard state tracking
├── levels/
│   └── Arena.ts         # Combat platform with bounds
├── rendering/
│   ├── Camera.ts        # Isometric OrthographicCamera
│   └── Renderer.ts      # WebGLRenderer + bloom post-processing
├── systems/
│   ├── EnemySpawner.ts  # Wave-based enemy spawning
│   └── ProgressionSystem.ts # XP tracking, level-ups
├── ui/
│   └── HUD.ts           # HTML overlay for stats
└── styles/
    └── hud.css          # HUD styling
```

## Project Conventions

### Code Style

**TypeScript:**
- Use strict mode (`strict: true` in tsconfig)
- Prefer interfaces for data shapes, classes for entities/systems
- Use `readonly` for immutable properties
- Export types from the same file as their implementation
- Never use `require()` — project uses ES modules
- Never use `any` — maintain type safety

**Naming:**
- Classes: PascalCase (`PlayerStats`, `CombatSystem`)
```typescript
// Example entity structure
export class Entity {
  public mesh: THREE.Mesh;
  
  public get position(): THREE.Vector3 {
    return this.mesh.position;
  }
  
  public update(deltaTime: number): void {
    // Update logic
  }
}
```

**Combat System:**
- **Weapons** implement the `Weapon` interface with cooldown-based auto-attacks
- **CombatSystem** handles hit detection, damage application, and death effects
- **AreaPulse** is the current weapon — an expanding ring that damages enemies when it reaches them

**Progression:**
- XP is awarded per kill via `ProgressionSystem.awardKillXP()`
- Level-ups increase stats: `damageMultiplier`, `attackRate`, `moveSpeed`
- XP requirements scale exponentially: `100 * 1.5^(level-1)`

- Methods/variables: camelCase (`currentHealth`, `applyDamage`)
- Constants: UPPER_SNAKE_CASE for truly global, camelCase for class-level
- Private members: prefix with `private`, no underscore

**Three.js Specifics:**
- Import as namespace: `import * as THREE from 'three'`
- Post-processing: `import { X } from 'three/addons/postprocessing/X.js'`
- Use `THREE.Vector3` for positions, don't use raw objects
- Don't create new Vector3 instances in hot loops (reuse them)
- Always `dispose()` geometries and materials when removing objects

**Comments:**
- Use JSDoc for public methods and classes
- Inline comments for complex logic only
- Keep comments concise and meaningful

### Architecture Patterns

**Game Loop:**
The `Game` class owns the main loop via `requestAnimationFrame`. Each frame:
1. Calculate `deltaTime` from `THREE.Clock`
2. Update input → player → enemies → combat → progression
3. Render scene with post-processing
evelopment

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## D
**Entity Pattern:**
Entities (Player, Enemy) are classes that:
- Own a `THREE.Mesh` as their visual representation
- Have an `update(deltaTime, ...)` method called each frame
- Expose a `position` getter that returns `mesh.position`

**Systems Pattern:**
Systems (CombatSystem, ProgressionSystem, EnemySpawner) are classes that:
- Are instantiated in `Game` constructor
- Have `update()` called in the game loop
- Orchestrate behavior across multiple entities

**No ECS** — simple class-based architecture preferred.

### Testing Strategy

Currently no automated testing framework in place. Manual browser testing is the primary validation method.

### Git Workflow

- Use GitHub CLI (`gh`) for creating branches, commits, and pull requests
- Main branch: `main`
- Feature branches for new work

## Domain Context

**Coordinate System:**
- World Y-axis: Up (vertical)
- World XZ-plane: Ground (horizontal)
- Camera: Isometric at 45° rotation, 35.264° elevation
- Screen-to-world mapping:
  - W (up on screen) → moves toward (-1, 0, -1) normalized
  - D (right on screen) → moves toward (1, 0, -1) normalized

**Visual Style:**
| Element | Color | Usage |
|---------|-------|-------|
| Player | `0x00ffff` | Cyan, emissive glow |
| Chaser Enemy | `0xff3366` | Red-pink, aggressive |
| Wanderer Enemy | `0xff9900` | Orange, passive |
| Arena Edges | `0x00ffff` | Cyan glow |
| Background | `0x0a0a0f` | Near-black |
| Floor | `0x12121a` | Dark gray |

**Materials:**
- Use `MeshStandardMaterial` with `emissive` and `emissiveIntensity` for glow
- Set `flatShading: true` for geometric aesthetic
- Add `EdgesGeometry` + `LineSegments` for edge visibility

**Post-Processing:**
- UnrealBloomPass: strength 0.8, radius 0.4, threshold 0.85
- ACES filmic tone mapping


## Key Interfaces

```typescript
// entities/PlayerStats.ts
interface PlayerStats {
  damageMultiplier: number;  // Base: 1.0
  attackRate: number;        // Base: 1.0
  maxHealth: number;         // Base: 100
  currentHealth: number;
  moveSpeed: number;         // Base: 1.0
  level: number;             // Starts at 1
}

// levels/Arena.ts
interface ArenaBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}
```

## Common Tasks

### Adding a New Enemy Type
1. Add type to `EnemyType` union in `src/entities/Enemy.ts`
2. Add geometry/color/behavior branch in `Enemy` constructor
3. Add update behavior method (`updateNewType`)
4. Update `EnemySpawner` spawn logic if needed

### Adding a New Weapon
1. Create class implementing `Weapon` interface in `src/combat/`
2. Implement: `canAttack()`, `attack()`, `update()`, `getVisualEffect()`
3. Add to `Game` and wire to `CombatSystem`

### Adding UI Elements
1. Add HTML structure in `HUD.createHUDContainer()`
2. Add element reference in HUD class properties
3. Add update method and styles in `src/styles/hud.css`

### Adding a New System
1. Create class in `src/systems/`
2. Instantiate in `Game` constructor
3. Call `update()` in game loop
4. Connect to other systems as needed

## Important Notes for AI Agents

1. **Screen-relative movement**: WASD maps to isometric directions via rotation vectors in Player
2. **Pulse hit detection**: Enemies are hit when the expanding ring reaches them, not instantly
3. **Wave scaling**: Enemy health scales with `wave` parameter passed to constructor
4. **Bounds checking**: All entities respect `ArenaBounds` from Arena
5. **Memory management**: Dispose of Three.js geometries and materials when removing objects
6. **HUD is HTML**: UI is not Three.js — it's a DOM overlay styled with CSS

## Do's and Don'ts

**Don't:**
- Use `require()` — project uses ES modules
- Use `any` type — maintain type safety
- Create new Vector3 instances in hot loops (reuse them)
- Forget to `dispose()` Three.js geometries/materials when removing objects

**Do:**
- Follow existing code patterns and naming conventions
- Add JSDoc comments to public methods
- Use `readonly` for properties that shouldn't change
- Test changes in browser before committing
- **Update this file** when adding new files, changing interfaces, or modifying constants
**Key Constants:**
| Constant | Value | Location |
|----------|-------|----------|
| Arena size | 24x24 | Arena.ts |
| Player base speed | 8 | Player.ts |
| Chaser speed | 3 | Enemy.ts |
| Wanderer speed | 2 | Enemy.ts |
| Base pulse damage | 25 | AreaPulse.ts |
| Base pulse cooldown | 1.0s | AreaPulse.ts |
| Base XP per kill | 25 | ProgressionSystem.ts |
| XP formula | 100 * 1.5^(level-1) | PlayerStats.ts |

## Important Constraints

**Design Constraints:**
- Abstract/geometric visuals only — no realistic, medieval, or narrative-driven elements
- All entities represented as simple geometric forms
- Visual identity relies on shape, motion, color, and light rather than texture
- Minimalist storytelling — no dialogue, story emerges through escalation and visuals

**Technical Constraints:**
- Browser-first (WebGL) — must run efficiently in browsers
- Clean, low-poly or flat-shaded geometry
- Limited color palette with strong contrast
- Effects focused on emissive materials, glow, and motion clarity

**Gameplay Constraints:**
- Single-run gameplay loop with permanent death
- Player power grows meaningfully, but survival always remains fragile
- Enemy difficulty scales with progression (health, damage, count, behavior complexity)

## External Dependencies

**Runtime Dependencies:**
- Three.js (3D rendering)

**Development Dependencies:**
- Vite (dev server & bundling)
- TypeScript (type checking & compilation)

**No external APIs or services required** — the game runs entirely client-side.
