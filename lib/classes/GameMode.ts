/**
 * Class 4: GameMode
 * Defines different game modes for Minesweeper.
 */
export enum GameModeType {
  CLASSIC = "classic",
  TIME_ATTACK = "time_attack",
}

export interface GameModeConfig {
  type: GameModeType;
  name: string;
  description: string;
  timeLimit?: number; // in seconds, for time attack mode
  bonusMultiplier: number;
}

export class GameMode {
  private _type: GameModeType;
  private _name: string;
  private _description: string;
  private _timeLimit: number | null;
  private _bonusMultiplier: number;

  constructor(config: GameModeConfig) {
    this._type = config.type;
    this._name = config.name;
    this._description = config.description;
    this._timeLimit = config.timeLimit ?? null;
    this._bonusMultiplier = config.bonusMultiplier;
  }

  // Getters
  get type(): GameModeType {
    return this._type;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get timeLimit(): number | null {
    return this._timeLimit;
  }

  get bonusMultiplier(): number {
    return this._bonusMultiplier;
  }

  /**
   * Checks if the game mode has a time limit.
   */
  hasTimeLimit(): boolean {
    return this._timeLimit !== null && this._timeLimit > 0;
  }

  /**
   * Checks if time has expired for time-limited modes.
   */
  isTimeExpired(elapsedSeconds: number): boolean {
    if (!this.hasTimeLimit()) {
      return false;
    }
    return elapsedSeconds >= this._timeLimit!;
  }

  /**
   * Gets remaining time for time-limited modes.
   */
  getRemainingTime(elapsedSeconds: number): number | null {
    if (!this.hasTimeLimit()) {
      return null;
    }
    return Math.max(0, this._timeLimit! - elapsedSeconds);
  }

  /**
   * Calculates bonus points based on game mode.
   */
  calculateBonus(basePoints: number): number {
    return Math.floor(basePoints * this._bonusMultiplier);
  }

  /**
   * Returns a serializable representation.
   */
  toJSON(): GameModeConfig {
    return {
      type: this._type,
      name: this._name,
      description: this._description,
      timeLimit: this._timeLimit ?? undefined,
      bonusMultiplier: this._bonusMultiplier,
    };
  }
}

// Predefined game modes
export const GAME_MODES: Record<GameModeType, GameMode> = {
  [GameModeType.CLASSIC]: new GameMode({
    type: GameModeType.CLASSIC,
    name: "Classic",
    description:
      "Traditional Minesweeper with no time limit. Clear all safe cells to win!",
    bonusMultiplier: 1.0,
  }),
  [GameModeType.TIME_ATTACK]: new GameMode({
    type: GameModeType.TIME_ATTACK,
    name: "Time Attack",
    description:
      "Race against the clock! Complete the board before time runs out for bonus points.",
    timeLimit: 120, // 2 minutes
    bonusMultiplier: 2.0,
  }),
};

// Time attack configurations per difficulty
export const TIME_ATTACK_LIMITS = {
  small: 60, // 1 minute
  medium: 180, // 3 minutes
  large: 300, // 5 minutes
} as const;
