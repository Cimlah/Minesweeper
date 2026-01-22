import { PowerUp, PowerUpCallback } from "./PowerUp";

/**
 * Class 10: TimeFreezeoPowerUp
 * Freezes the game timer for a specified duration.
 */
export class TimeFreezePowerUp extends PowerUp {
  private _onFreeze: PowerUpCallback | null;
  private _onUnfreeze: PowerUpCallback | null;

  constructor() {
    super({
      id: "time_freeze",
      name: "Time Freeze",
      description: "Freezes the timer for 10 seconds",
      icon: "❄️",
      cost: 50,
      duration: 10000, // 10 seconds
      maxUses: 3,
    });

    this._onFreeze = null;
    this._onUnfreeze = null;
  }

  /**
   * Sets the callback for when timer is frozen.
   */
  setOnFreeze(callback: PowerUpCallback): void {
    this._onFreeze = callback;
  }

  /**
   * Sets the callback for when timer is unfrozen.
   */
  setOnUnfreeze(callback: PowerUpCallback): void {
    this._onUnfreeze = callback;
  }

  protected onActivate(): void {
    if (this._onFreeze) {
      this._onFreeze();
    }
  }

  protected onDeactivate(): void {
    if (this._onUnfreeze) {
      this._onUnfreeze();
    }
  }
}
