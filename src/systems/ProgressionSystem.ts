import { PlayerStats, xpForLevel } from '../entities/PlayerStats';
import { HUD } from '../ui/HUD';

export interface LevelUpResult {
  newLevel: number;
  statIncreases: {
    damage: number;
    attackRate: number;
    speed: number;
  };
}

/**
 * ProgressionSystem - Handles XP tracking, level-ups, and stat upgrades.
 */
export class ProgressionSystem {
  private currentXP: number = 0;
  private xpToNextLevel: number;
  private currentWave: number = 1;
  private hud: HUD;

  // Base XP reward per enemy kill
  private readonly baseXPPerKill: number = 25;

  // Stat increase per level (multiplied by level for scaling)
  private readonly damagePerLevel: number = 0.1;    // +10% per level
  private readonly attackRatePerLevel: number = 0.05; // +5% per level
  private readonly speedPerLevel: number = 0.03;    // +3% per level

  constructor(hud: HUD, initialLevel: number = 1) {
    this.hud = hud;
    this.xpToNextLevel = xpForLevel(initialLevel);
  }

  /**
   * Award XP for killing an enemy
   * @returns LevelUpResult if player leveled up, null otherwise
   */
  public awardKillXP(stats: PlayerStats, enemyLevel: number = 1): LevelUpResult | null {
    // XP scales with enemy level
    const xpGained = Math.floor(this.baseXPPerKill * (1 + (enemyLevel - 1) * 0.5));
    return this.addXP(stats, xpGained);
  }

  /**
   * Add XP and check for level up
   */
  public addXP(stats: PlayerStats, amount: number): LevelUpResult | null {
    this.currentXP += amount;

    // Check for level up
    if (this.currentXP >= this.xpToNextLevel) {
      return this.levelUp(stats);
    }

    return null;
  }

  /**
   * Process a level up - upgrade stats and return the increases
   */
  private levelUp(stats: PlayerStats): LevelUpResult {
    // Carry over excess XP
    this.currentXP -= this.xpToNextLevel;
    stats.level++;
    
    // Calculate stat increases
    const statIncreases = {
      damage: this.damagePerLevel,
      attackRate: this.attackRatePerLevel,
      speed: this.speedPerLevel,
    };

    // Apply stat upgrades
    stats.damageMultiplier += statIncreases.damage;
    stats.attackRate += statIncreases.attackRate;
    stats.moveSpeed += statIncreases.speed;

    // Heal player slightly on level up
    const healAmount = stats.maxHealth * 0.2;
    stats.currentHealth = Math.min(stats.maxHealth, stats.currentHealth + healAmount);

    // Update XP requirement for next level
    this.xpToNextLevel = xpForLevel(stats.level);

    // Show level up notification
    this.hud.showLevelUp(stats.level, statIncreases);

    return {
      newLevel: stats.level,
      statIncreases,
    };
  }

  /**
   * Set the current wave number
   */
  public setWave(wave: number): void {
    this.currentWave = wave;
  }

  /**
   * Get current wave
   */
  public getWave(): number {
    return this.currentWave;
  }

  /**
   * Update HUD display
   */
  public updateHUD(stats: PlayerStats): void {
    this.hud.update(stats, this.currentXP, this.xpToNextLevel, this.currentWave);
  }

  /**
   * Apply damage to player
   * @returns true if player died
   */
  public applyDamage(stats: PlayerStats, damage: number): boolean {
    stats.currentHealth -= damage;
    this.hud.flashDamage();

    if (stats.currentHealth <= 0) {
      stats.currentHealth = 0;
      return true; // Player died
    }

    return false;
  }

  /**
   * Get current XP for display
   */
  public getCurrentXP(): number {
    return this.currentXP;
  }

  /**
   * Get XP needed for next level
   */
  public getXPToNextLevel(): number {
    return this.xpToNextLevel;
  }
}
