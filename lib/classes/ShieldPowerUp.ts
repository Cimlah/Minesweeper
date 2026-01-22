import { PowerUp, PowerUpCallback } from "./PowerUp";

/**
 * Class 11: ShieldPowerUp
 * Protects the player from one mine explosion.
 */
export class ShieldPowerUp extends PowerUp {
  private _onShieldActivate: PowerUpCallback | null;
  private _onShieldBreak: PowerUpCallback | null;
  private _shieldBroken: boolean;

  constructor() {
    super({
      id: "shield",
      name: "Shield",
      description: "Protects you from one mine explosion",
      icon: "🛡️",
      cost: 100,
      duration: 0, // Lasts until used or game ends
      maxUses: 2,
    });

    this._onShieldActivate = null;
    this._onShieldBreak = null;
    this._shieldBroken = false;
  }

  // Getters
  get shieldBroken(): boolean {
    return this._shieldBroken;
  }

  /**
   * Sets the callback for when shield is activated.
   */
  setOnShieldActivate(callback: PowerUpCallback): void {
    this._onShieldActivate = callback;
  }

  /**
   * Sets the callback for when shield breaks.
   */
  setOnShieldBreak(callback: PowerUpCallback): void {
    this._onShieldBreak = callback;
  }

  /**
   * Uses the shield to block a mine explosion.
   * @returns true if shield was used, false if not active
   */
  useShield(): boolean {
    if (!this._isActive) {
      return false;
    }

    this._shieldBroken = true;
    this.deactivate();
    return true;
  }

  protected onActivate(): void {
    this._shieldBroken = false;
    if (this._onShieldActivate) {
      this._onShieldActivate();
    }
  }

  protected onDeactivate(): void {
    if (this._shieldBroken && this._onShieldBreak) {
      this._onShieldBreak();
    }
  }

  /**
   * Resets the power-up.
   */
  reset(): void {
    super.reset();
    this._shieldBroken = false;
  }
}
