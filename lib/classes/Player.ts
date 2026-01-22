import { Statistics } from "./Statistics";
import {
  AchievementManager,
  AchievementManagerData,
} from "./AchievementManager";
import { ThemeShop, ThemeShopData } from "./ThemeShop";

/**
 * Class 8: Player
 * Represents a player with their statistics, achievements, and inventory.
 */
export class Player {
  private _id: string;
  private _name: string;
  private _points: number;
  private _statistics: Statistics;
  private _achievementManager: AchievementManager;
  private _themeShop: ThemeShop;
  private _createdAt: Date;

  constructor(name: string = "Player") {
    this._id = this.generateId();
    this._name = name;
    this._points = 0;
    this._statistics = new Statistics();
    this._achievementManager = new AchievementManager();
    this._themeShop = new ThemeShop();
    this._createdAt = new Date();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get points(): number {
    return this._points;
  }

  get statistics(): Statistics {
    return this._statistics;
  }

  get achievementManager(): AchievementManager {
    return this._achievementManager;
  }

  get themeShop(): ThemeShop {
    return this._themeShop;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  // Setters
  set name(value: string) {
    this._name = value;
  }

  /**
   * Generates a unique player ID.
   */
  private generateId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Adds points to the player.
   */
  addPoints(amount: number): void {
    this._points += Math.max(0, amount);
  }

  /**
   * Subtracts points from the player.
   * @returns true if successful, false if insufficient points
   */
  spendPoints(amount: number): boolean {
    if (amount > this._points) {
      return false;
    }
    this._points -= amount;
    return true;
  }

  /**
   * Calculates points earned for a game.
   */
  calculateGamePoints(
    won: boolean,
    timeTaken: number,
    difficulty: string,
    modeMultiplier: number = 1,
  ): number {
    if (!won) {
      return 0;
    }

    const difficultyMultipliers: Record<string, number> = {
      small: 1,
      medium: 2,
      large: 3,
    };

    const diffMultiplier = difficultyMultipliers[difficulty] ?? 1;

    // Base points for winning
    let points = 100;

    // Time bonus (faster = more points)
    const timeBonus = Math.max(0, 300 - timeTaken);
    points += timeBonus;

    // Apply multipliers
    points = Math.floor(points * diffMultiplier * modeMultiplier);

    return points;
  }

  /**
   * Records a game result and updates stats.
   */
  recordGame(
    won: boolean,
    timeTaken: number,
    minesCleared: number,
    difficulty: string,
    modeMultiplier: number = 1,
  ): number {
    if (won) {
      this._statistics.recordWin(timeTaken, minesCleared, difficulty);
      const points = this.calculateGamePoints(
        won,
        timeTaken,
        difficulty,
        modeMultiplier,
      );
      this.addPoints(points);

      // Check achievements
      this._achievementManager.checkAchievements(this._statistics, {
        won,
        timeTaken,
        difficulty,
        minesCleared,
      });

      return points;
    } else {
      this._statistics.recordLoss(timeTaken);
      return 0;
    }
  }

  /**
   * Resets all player data.
   */
  reset(): void {
    this._points = 0;
    this._statistics.reset();
    this._achievementManager.reset();
    this._themeShop.reset();
  }

  /**
   * Returns a serializable representation.
   */
  toJSON(): PlayerData {
    return {
      id: this._id,
      name: this._name,
      points: this._points,
      statistics: this._statistics.toJSON(),
      achievements: this._achievementManager.toJSON(),
      themeShop: this._themeShop.toJSON(),
      createdAt: this._createdAt.toISOString(),
    };
  }

  /**
   * Creates a Player from serialized data.
   */
  static fromJSON(data: PlayerData): Player {
    const player = new Player(data.name);
    player._id = data.id;
    player._points = data.points;
    player._statistics = Statistics.fromJSON(data.statistics);
    player._achievementManager = AchievementManager.fromJSON(data.achievements);
    player._themeShop = ThemeShop.fromJSON(data.themeShop);
    player._createdAt = new Date(data.createdAt);
    return player;
  }

  /**
   * Saves player data to localStorage.
   */
  save(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("minesweeper_player", JSON.stringify(this.toJSON()));
    }
  }

  /**
   * Loads player data from localStorage.
   */
  static load(): Player | null {
    if (typeof window === "undefined") {
      return null;
    }
    const data = localStorage.getItem("minesweeper_player");
    if (!data) {
      return null;
    }
    try {
      return Player.fromJSON(JSON.parse(data));
    } catch {
      return null;
    }
  }
}

export interface PlayerData {
  id: string;
  name: string;
  points: number;
  statistics: ReturnType<Statistics["toJSON"]>;
  achievements: AchievementManagerData;
  themeShop: ThemeShopData;
  createdAt: string;
}
