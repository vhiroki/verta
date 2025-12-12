/**
 * Manages keyboard input with state tracking.
 * Provides a clean interface to check which keys are currently pressed.
 */
export class InputManager {
  private keys: Set<string> = new Set();

  constructor() {
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
    
    // Clear keys when window loses focus to prevent stuck keys
    window.addEventListener('blur', this.onBlur.bind(this));
  }

  private onKeyDown(event: KeyboardEvent): void {
    this.keys.add(event.code);
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.keys.delete(event.code);
  }

  private onBlur(): void {
    this.keys.clear();
  }

  /**
   * Check if a specific key is currently pressed
   */
  public isKeyPressed(code: string): boolean {
    return this.keys.has(code);
  }

  /**
   * Get movement input as a normalized vector based on WASD keys.
   * Returns screen-relative direction (W = up on screen, etc.)
   */
  public getMovementInput(): { x: number; y: number } {
    let x = 0;
    let y = 0;

    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) y += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) y -= 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) x += 1;

    // Normalize diagonal movement
    if (x !== 0 && y !== 0) {
      const length = Math.sqrt(x * x + y * y);
      x /= length;
      y /= length;
    }

    return { x, y };
  }

  public dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown.bind(this));
    window.removeEventListener('keyup', this.onKeyUp.bind(this));
    window.removeEventListener('blur', this.onBlur.bind(this));
  }
}
