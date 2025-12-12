import * as THREE from 'three';
import { Renderer } from './rendering/Renderer';
import { Camera } from './rendering/Camera';
import { InputManager } from './input/InputManager';
import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { Arena } from './levels/Arena';
import { EnemySpawner } from './systems/EnemySpawner';
import { AreaPulse } from './combat/AreaPulse';
import { CombatSystem } from './combat/CombatSystem';
import { PlayerStats, createDefaultStats } from './entities/PlayerStats';
import { HUD } from './ui/HUD';
import { ProgressionSystem } from './systems/ProgressionSystem';

export class Game {
  private renderer: Renderer;
  private camera: Camera;
  private scene: THREE.Scene;
  private isRunning: boolean = false;
  
  private inputManager: InputManager;
  private player: Player;
  private clock: THREE.Clock;
  private arena: Arena;
  private enemies: Enemy[] = [];
  private enemySpawner: EnemySpawner;
  
  // Combat
  private weapon: AreaPulse;
  private combatSystem: CombatSystem;
  private playerStats: PlayerStats;

  // UI and Progression
  private hud: HUD;
  private progressionSystem: ProgressionSystem;
  private currentWave: number = 1;
  private isGameOver: boolean = false;

  constructor(container: HTMLElement) {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0f);

    // Initialize camera and renderer
    this.camera = new Camera();
    this.renderer = new Renderer(container, this.camera.instance);

    // Initialize input and clock
    this.inputManager = new InputManager();
    this.clock = new THREE.Clock();

    // Initialize player stats
    this.playerStats = createDefaultStats();

    // Create arena
    this.arena = new Arena(24, 24);
    this.scene.add(this.arena.group);

    // Create player
    this.player = new Player(this.inputManager);
    this.scene.add(this.player.mesh);

    // Create weapon and add visual effect to scene
    this.weapon = new AreaPulse(25, 1.0);
    const weaponEffect = this.weapon.getVisualEffect();
    if (weaponEffect) {
      this.scene.add(weaponEffect);
    }

    // Create combat system
    this.combatSystem = new CombatSystem(this.scene);

    // Create HUD and progression system
    this.hud = new HUD();
    this.progressionSystem = new ProgressionSystem(this.hud, this.playerStats.level);

    // Create enemy spawner and spawn initial wave
    this.enemySpawner = new EnemySpawner(this.arena.bounds);
    this.spawnEnemyWave(3);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    // Handle window resize
    window.addEventListener('resize', this.onResize.bind(this));
    
    // Handle restart on space key
    window.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Space' && this.isGameOver) {
      event.preventDefault();
      this.restart();
    }
  }

  private spawnEnemyWave(count: number): void {
    const newEnemies = this.enemySpawner.spawnWave(count, this.player.position, this.currentWave);
    newEnemies.forEach(enemy => {
      this.enemies.push(enemy);
      this.scene.add(enemy.mesh);
    });
  }

  private onResize(): void {
    this.camera.onResize();
    this.renderer.onResize();
  }

  public start(): void {
    this.isRunning = true;
    this.gameLoop();
  }

  public stop(): void {
    this.isRunning = false;
  }

  private gameLoop(): void {
    if (!this.isRunning) return;

    requestAnimationFrame(this.gameLoop.bind(this));

    const deltaTime = this.clock.getDelta();

    // Update player with arena bounds
    this.player.update(deltaTime, this.arena.bounds);

    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime, this.player.position, this.arena.bounds);
    });

    // Update weapon cooldown with player's attack rate
    this.weapon.update(deltaTime, this.playerStats.attackRate);

    // Auto-attack when weapon is ready
    if (this.weapon.canAttack()) {
      this.weapon.attack(
        this.player.position,
        this.playerStats.damageMultiplier
      );
    }

    // Process pulse hits progressively as ring expands
    const pulseState = this.weapon.getPulseState();
    const damageEvents = this.combatSystem.processPulseHits(pulseState, this.enemies);
    
    // Award XP for kills
    damageEvents.forEach(event => {
      if (event.killed) {
        this.progressionSystem.awardKillXP(this.playerStats, this.currentWave);
      }
    });

    // Check for player collision with enemies
    if (this.combatSystem.checkPlayerCollision(this.player.position, this.enemies)) {
      // Apply contact damage (25 damage per second)
      const contactDamage = 25 * deltaTime;
      const playerDied = this.progressionSystem.applyDamage(this.playerStats, contactDamage);
      // Flash player red
      this.player.flashDamage();
      
      // Check if player died
      if (playerDied) {
        this.gameOver();
        return;
      }
    }

    // Update combat system (death animations)
    this.combatSystem.update(deltaTime);

    // Clean up dead enemies
    this.enemies = this.enemies.filter(e => e.isAlive);

    // Check for wave completion - spawn new wave if all enemies dead
    if (this.enemies.length === 0) {
      this.currentWave++;
      this.progressionSystem.setWave(this.currentWave);
      // Spawn more enemies each wave
      this.spawnEnemyWave(3 + this.currentWave);
    }

    // Update HUD
    this.progressionSystem.updateHUD(this.playerStats);

    // Update player speed based on stats
    this.player.setSpeedMultiplier(this.playerStats.moveSpeed);

    // Render the scene
    this.renderer.render(this.scene);
  }

  private gameOver(): void {
    this.isGameOver = true;
    this.isRunning = false;
    
    // Show game over screen
    this.hud.showGameOver(this.playerStats.level, this.currentWave);
  }

  private restart(): void {
    // Reset player stats
    this.playerStats = createDefaultStats();
    
    // Reset wave and progression
    this.currentWave = 1;
    this.progressionSystem.reset();
    
    // Reset player position
    this.player.mesh.position.set(0, 0.8, 0);
    
    // Clear all enemies
    this.enemies.forEach(enemy => this.scene.remove(enemy.mesh));
    this.enemies = [];
    
    // Spawn new wave
    this.spawnEnemyWave(3);
    
    // Reset game state
    this.isGameOver = false;
    this.hud.hideGameOver();
    
    // Restart game loop
    this.start();
  }
}
