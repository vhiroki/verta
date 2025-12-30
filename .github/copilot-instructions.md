# VERTA — Copilot Instructions

## Project Overview

VERTA is a minimalist 3D roguelike browser game built with **Three.js + TypeScript + Vite**. The player climbs an abstract geometric structure, fighting enemies to gain XP and level up until reaching the apex or dying.

**Key Design Principles:**
- Abstract/geometric visuals — no realistic or narrative elements
- Simple class-based architecture (no ECS)
- Isometric camera with screen-relative controls
- HTML/CSS overlay for HUD
- Browser-first (WebGL)

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Three.js | ^0.169.0 | 3D rendering, WebGL |
| TypeScript | ^5.6.0 | Type-safe development |
| Vite | ^6.0.0 | Dev server & bundling |

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

## Architecture Patterns

### Game Loop
The `Game` class owns the main loop via `requestAnimationFrame`. Each frame:
1. Calculate `deltaTime` from `THREE.Clock`
2. Update input → player → enemies → combat → progression
3. Render scene with post-processing

### Entity Pattern
Entities (Player, Enemy) are classes that:
- Own a `THREE.Mesh` as their visual representation
- Have an `update(deltaTime, ...)` method called each frame
- Expose a `position` getter that returns `mesh.position`

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

### Combat System
- **Weapons** implement the `Weapon` interface with cooldown-based auto-attacks
- **CombatSystem** handles hit detection, damage application, and death effects
- **AreaPulse** is the current weapon — an expanding ring that damages enemies when it reaches them

### Progression
- XP is awarded per kill via `ProgressionSystem.awardKillXP()`
- Level-ups increase stats: `damageMultiplier`, `attackRate`, `moveSpeed`
- XP requirements scale exponentially: `100 * 1.5^(level-1)`

## Coding Conventions

### TypeScript
- Use strict mode (`strict: true` in tsconfig)
- Prefer interfaces for data shapes, classes for entities/systems
- Use `readonly` for immutable properties
- Export types from the same file as their implementation

### Three.js
- Import as namespace: `import * as THREE from 'three'`
- Post-processing from `three/addons/`: `import { X } from 'three/addons/postprocessing/X.js'`
- Use `THREE.Vector3` for positions, don't use raw objects
- Always clean up meshes when removing from scene (geometry.dispose(), material.dispose())

### Naming
- Classes: PascalCase (`PlayerStats`, `CombatSystem`)
- Methods/variables: camelCase (`currentHealth`, `applyDamage`)
- Constants: UPPER_SNAKE_CASE for truly global, camelCase for class-level
- Private members: prefix with `private`, no underscore

### Comments
- Use JSDoc for public methods and classes
- Inline comments for complex logic only
- Keep comments concise and meaningful

## Visual Style

### Colors (Hex)
| Element | Color | Usage |
|---------|-------|-------|
| Player | `0x00ffff` | Cyan, emissive glow |
| Chaser Enemy | `0xff3366` | Red-pink, aggressive |
| Wanderer Enemy | `0xff9900` | Orange, passive |
| Arena Edges | `0x00ffff` | Cyan glow |
| Background | `0x0a0a0f` | Near-black |
| Floor | `0x12121a` | Dark gray |

### Materials
- Use `MeshStandardMaterial` with `emissive` and `emissiveIntensity` for glow
- Set `flatShading: true` for geometric aesthetic
- Add `EdgesGeometry` + `LineSegments` for edge visibility

### Post-Processing
- UnrealBloomPass: strength 0.8, radius 0.4, threshold 0.85
- ACES filmic tone mapping

## Common Tasks

### Adding a New Enemy Type
1. Add type to `EnemyType` union in [Enemy.ts](src/entities/Enemy.ts)
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
3. Add update method and styles in [hud.css](src/styles/hud.css)

### Adding a New System
1. Create class in `src/systems/`
2. Instantiate in `Game` constructor
3. Call `update()` in game loop
4. Connect to other systems as needed

## Development

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

## Coordinate System

- **World Y-axis**: Up (vertical)
- **World XZ-plane**: Ground (horizontal)
- **Camera**: Isometric at 45° rotation, 35.264° elevation
- **Screen-to-world mapping**:
  - W (up on screen) → moves toward (-1, 0, -1) normalized
  - D (right on screen) → moves toward (1, 0, -1) normalized

## Constants Reference

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
- **Update this instructions file** when adding new files, changing interfaces, or modifying constants
