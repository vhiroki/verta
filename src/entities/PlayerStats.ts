/**
 * Player stats that can be upgraded on level-up.
 */
export interface PlayerStats {
  /** Base damage multiplier (1.0 = 100%) */
  damageMultiplier: number;
  
  /** Attack rate multiplier - higher = faster attacks (1.0 = base speed) */
  attackRate: number;
  
  /** Maximum health */
  maxHealth: number;
  
  /** Current health */
  currentHealth: number;
  
  /** Movement speed multiplier */
  moveSpeed: number;
  
  /** Current level */
  level: number;
}

/**
 * Creates default starting stats
 */
export function createDefaultStats(): PlayerStats {
  return {
    damageMultiplier: 1.0,
    attackRate: 1.0,
    maxHealth: 100,
    currentHealth: 100,
    moveSpeed: 1.0,
    level: 1,
  };
}

/**
 * Calculate XP required for a given level
 */
export function xpForLevel(level: number): number {
  // Exponential scaling: each level requires more XP
  return Math.floor(100 * Math.pow(1.5, level - 1));
}
