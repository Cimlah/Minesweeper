/**
 * Class 9: PowerUp
 * Base class for all power-ups in the game.
 */
export abstract class PowerUp {
  protected _id: string;
  protected _name: string;
  protected _description: string;
  protected _icon: string;
  protected _cost: number;
  protected _duration: number; // in milliseconds
  protected _isActive: boolean;
  protected _usesRemaining: number;
  protected _maxUses: number;

  constructor(config: PowerUpConfig) {
    this._id = config.id;
    this._name = config.name;
    this._description = config.description;
    this._icon = config.icon;
    this._cost = config.cost;
    this._duration = config.duration;
    this._isActive = false;
    this._maxUses = config.maxUses ?? 1;
    this._usesRemaining = this._maxUses;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get icon(): string {
    return this._icon;
  }

  get cost(): number {
    return this._cost;
  }

  get duration(): number {
    return this._duration;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get usesRemaining(): number {
    return this._usesRemaining;
  }

  get maxUses(): number {
    return this._maxUses;
  }

  /**
   * Checks if the power-up can be activated.
   */
  canActivate(): boolean {
    return !this._isActive && this._usesRemaining > 0;
  }

  /**
   * Activates the power-up.
   * @returns true if activation was successful
   */
  activate(): boolean {
    if (!this.canActivate()) {
      return false;
    }

    this._isActive = true;
    this._usesRemaining--;
    this.onActivate();

    // Auto-deactivate after duration
    if (this._duration > 0) {
      setTimeout(() => {
        this.deactivate();
      }, this._duration);
    }

    return true;
  }

  /**
   * Deactivates the power-up.
   */
  deactivate(): void {
    if (this._isActive) {
      this._isActive = false;
      this.onDeactivate();
    }
  }

  /**
   * Resets the power-up.
   */
  reset(): void {
    this._isActive = false;
    this._usesRemaining = this._maxUses;
  }

  /**
   * Adds a use to the power-up.
   */
  addUse(): void {
    this._usesRemaining = Math.min(this._usesRemaining + 1, this._maxUses);
  }

  /**
   * Hook called when the power-up is activated.
   */
  protected abstract onActivate(): void;

  /**
   * Hook called when the power-up is deactivated.
   */
  protected abstract onDeactivate(): void;

  /**
   * Returns a serializable representation.
   */
  toJSON(): PowerUpData {
    return {
      id: this._id,
      usesRemaining: this._usesRemaining,
      isActive: this._isActive,
    };
  }
}

export interface PowerUpConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  duration: number;
  maxUses?: number;
}

export interface PowerUpData {
  id: string;
  usesRemaining: number;
  isActive: boolean;
}

export type PowerUpCallback = () => void;
