import '../styles/hud.css';
import { PlayerStats } from '../entities/PlayerStats';

/**
 * HUD - HTML/CSS overlay for displaying game stats.
 * Shows level, XP bar, health bar, and stat upgrades.
 */
export class HUD {
  private container: HTMLElement;
  private levelDisplay: HTMLElement;
  private xpFill: HTMLElement;
  private xpLabel: HTMLElement;
  private healthFill: HTMLElement;
  private healthText: HTMLElement;
  private statsContainer: HTMLElement;
  private levelUpDisplay: HTMLElement;
  private levelUpStats: HTMLElement;
  private waveDisplay: HTMLElement;
  private gameOverDisplay: HTMLElement;

  private levelUpTimeout: number | null = null;

  constructor() {
    this.container = this.createHUDContainer();
    document.body.appendChild(this.container);

    // Cache element references
    this.levelDisplay = this.container.querySelector('.hud-level')!;
    this.xpFill = this.container.querySelector('.hud-xp-fill')!;
    this.xpLabel = this.container.querySelector('.hud-xp-label')!;
    this.healthFill = this.container.querySelector('.hud-health-fill')!;
    this.healthText = this.container.querySelector('.hud-health-text')!;
    this.statsContainer = this.container.querySelector('.hud-top-right')!;
    this.levelUpDisplay = this.container.querySelector('.hud-level-up')!;
    this.levelUpStats = this.container.querySelector('.hud-level-up-stats')!;
    this.waveDisplay = this.container.querySelector('.hud-wave')!;
    this.gameOverDisplay = this.container.querySelector('.hud-game-over')!;
  }

  private createHUDContainer(): HTMLElement {
    const hud = document.createElement('div');
    hud.id = 'hud';
    hud.innerHTML = `
      <!-- Top Left: Level & XP -->
      <div class="hud-top-left">
        <div class="hud-level">LEVEL 1</div>
        <div class="hud-xp-container">
          <div class="hud-xp-label">XP: 0 / 100</div>
          <div class="hud-xp-bar">
            <div class="hud-xp-fill" style="width: 0%"></div>
          </div>
        </div>
      </div>

      <!-- Top Right: Stats -->
      <div class="hud-top-right">
        <div class="hud-stat">DMG: <span class="hud-stat-value">1.0x</span></div>
        <div class="hud-stat">RATE: <span class="hud-stat-value">1.0x</span></div>
        <div class="hud-stat">SPD: <span class="hud-stat-value">1.0x</span></div>
      </div>

      <!-- Wave indicator -->
      <div class="hud-wave">WAVE 1</div>

      <!-- Bottom Left: Health -->
      <div class="hud-bottom-left">
        <div class="hud-health-label">HEALTH</div>
        <div class="hud-health-bar">
          <div class="hud-health-fill" style="width: 100%"></div>
          <div class="hud-health-text">100 / 100</div>
        </div>
      </div>

      <!-- Center: Level Up notification -->
      <div class="hud-center">
        <div class="hud-level-up">
          LEVEL UP!
          <div class="hud-level-up-stats"></div>
        </div>
        <div class="hud-game-over">
          <div class="hud-game-over-title">GAME OVER</div>
          <div class="hud-game-over-stats"></div>
          <div class="hud-game-over-restart">Press SPACE to restart</div>
        </div>
      </div>
    `;
    return hud;
  }

  /**
   * Update all HUD elements based on current player stats
   */
  public update(stats: PlayerStats, currentXP: number, xpToNextLevel: number, wave: number): void {
    // Update level
    this.levelDisplay.textContent = `LEVEL ${stats.level}`;

    // Update XP bar
    const xpPercent = Math.min(100, (currentXP / xpToNextLevel) * 100);
    this.xpFill.style.width = `${xpPercent}%`;
    this.xpLabel.textContent = `XP: ${currentXP} / ${xpToNextLevel}`;

    // Update health
    const healthPercent = Math.min(100, (stats.currentHealth / stats.maxHealth) * 100);
    this.healthFill.style.width = `${healthPercent}%`;
    this.healthText.textContent = `${Math.ceil(stats.currentHealth)} / ${stats.maxHealth}`;

    // Update stats display
    this.statsContainer.innerHTML = `
      <div class="hud-stat">DMG: <span class="hud-stat-value">${stats.damageMultiplier.toFixed(1)}x</span></div>
      <div class="hud-stat">RATE: <span class="hud-stat-value">${stats.attackRate.toFixed(1)}x</span></div>
      <div class="hud-stat">SPD: <span class="hud-stat-value">${stats.moveSpeed.toFixed(1)}x</span></div>
    `;

    // Update wave
    this.waveDisplay.textContent = `WAVE ${wave}`;
  }

  /**
   * Show level up notification with stat increases
   */
  public showLevelUp(newLevel: number, statIncreases: { damage: number; attackRate: number; speed: number }): void {
    // Clear any existing timeout
    if (this.levelUpTimeout !== null) {
      clearTimeout(this.levelUpTimeout);
    }

    // Update level up text
    this.levelUpDisplay.innerHTML = `
      LEVEL ${newLevel}!
      <div class="hud-level-up-stats">
        +${(statIncreases.damage * 100).toFixed(0)}% DMG | 
        +${(statIncreases.attackRate * 100).toFixed(0)}% RATE | 
        +${(statIncreases.speed * 100).toFixed(0)}% SPD
      </div>
    `;

    // Show notification
    this.levelUpDisplay.classList.add('visible');

    // Hide after 2 seconds
    this.levelUpTimeout = window.setTimeout(() => {
      this.levelUpDisplay.classList.remove('visible');
      this.levelUpTimeout = null;
    }, 2000);
  }

  /**
   * Flash the health bar when taking damage
   */
  public flashDamage(): void {
    const healthBar = this.container.querySelector('.hud-health-bar') as HTMLElement;
    healthBar.style.boxShadow = '0 0 20px rgba(255, 50, 100, 1)';
    
    setTimeout(() => {
      healthBar.style.boxShadow = '';
    }, 150);
  }

  /**
   * Show game over screen
   */
  public showGameOver(level: number, wave: number): void {
    const statsEl = this.gameOverDisplay.querySelector('.hud-game-over-stats') as HTMLElement;
    statsEl.innerHTML = `Reached Level ${level} | Wave ${wave}`;
    this.gameOverDisplay.classList.add('visible');
  }

  /**
   * Hide game over screen
   */
  public hideGameOver(): void {
    this.gameOverDisplay.classList.remove('visible');
  }

  /**
   * Clean up HUD elements
   */
  public destroy(): void {
    if (this.levelUpTimeout !== null) {
      clearTimeout(this.levelUpTimeout);
    }
    this.container.remove();
  }
}
