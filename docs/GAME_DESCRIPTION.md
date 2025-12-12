VERTA — Game Design Summary

Overview

VERTA is a single-player, abstract 3D roguelike centered on vertical progression inside a hostile geometric structure.

The player begins at the base of a towering abstract construct and must climb upward through successive levels. Progression happens along two parallel axes:
	1.	Vertical movement — advancing to higher levels of the structure
	2.	Power scaling — gaining XP by defeating enemies, increasing player strength while enemies scale accordingly

The game ends when the player dies or when the final boss at the top of the structure is defeated.

⸻

Core Design Pillars

Abstract / Geometric Theme
	•	No medieval, realistic, or narrative-driven elements
	•	All entities are represented as simple geometric forms
	•	Visual identity relies on shape, motion, color, and light rather than texture or detail

Minimalist 3D Presentation
	•	Clean, low-poly or flat-shaded geometry
	•	Limited color palette with strong contrast
	•	Effects focused on emissive materials, glow, and motion clarity
	•	Designed to run efficiently in the browser (WebGL)

Roguelike Structure
	•	Single-run gameplay loop
	•	Permanent death
	•	Procedurally generated or semi-procedural levels
	•	Increasing difficulty over time and vertical progression

⸻

Core Gameplay Loop
	1.	Player spawns at the base level of the structure
	2.	Enemies spawn within the current level
	3.	Player defeats enemies to gain XP
	4.	XP increases player power (damage, survivability, abilities)
	5.	Enemies scale dynamically as the player progresses
	6.	Player advances upward to the next level
	7.	Periodic mini-boss encounters
	8.	Final boss encounter at the apex of the structure
	9.	Game ends on player death or final boss defeat

⸻

World & Entities

Structure
	•	A vertical, abstract construct composed of stacked geometric layers
	•	Each layer represents a self-contained combat space
	•	Visual complexity increases with height

Player
	•	Represented as a simple geometric form
	•	Movement and combat are precise, responsive, and readable

Enemies
	•	Hostile geometric entities
	•	Difficulty expressed through behavior patterns rather than visuals alone
	•	Increased density, speed, and attack complexity as progression continues

Bosses
	•	Large-scale geometric systems rather than characters
	•	Designed around multi-phase patterns and spatial challenges
	•	Mini-bosses appear at intervals; a final boss awaits at the top

⸻

Progression & Difficulty

Difficulty Scaling
	•	Enemy health and damage scale with progression
	•	Enemy count and behavioral complexity increase
	•	Later levels introduce overlapping threats and tighter spaces

Player Progression
	•	XP-driven stat growth (damage, health, speed, cooldowns)
	•	Ability modifiers (projectiles, chaining, area effects, transformations)
	•	Player power grows meaningfully, but survival always remains fragile

⸻

Target Platform
	•	Initial target: Browser (WebGL)
	•	Architecture should support future expansion to multi-platform releases

⸻

Tone & Experience Goals
	•	Clean, focused, and intense
	•	No explicit narrative required
	•	The structure feels like a living, adaptive system
	•	Failure is expected and integral to mastery

⸻

One-Line Pitch

VERTA is a minimalist 3D roguelike where you climb an ever-adapting geometric structure, growing stronger until you reach the apex — or break along the way.
