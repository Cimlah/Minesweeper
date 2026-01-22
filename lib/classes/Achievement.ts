import { Statistics } from "./Statistics";

/**
 * Class 6: Achievement
 * Represents a single achievement in the game.
 */
export class Achievement {
  private _id: string;
  private _name: string;
  private _description: string;
  private _icon: string;
  private _isUnlocked: boolean;
  private _unlockedAt: Date | null;
  private _checkCondition: (
    stats: Statistics,
    gameData?: GameAchievementData,
  ) => boolean;

  constructor(config: AchievementConfig) {
    this._id = config.id;
    this._name = config.name;
    this._description = config.description;
    this._icon = config.icon;
    this._isUnlocked = false;
    this._unlockedAt = null;
    this._checkCondition = config.checkCondition;
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

  get isUnlocked(): boolean {
    return this._isUnlocked;
  }

  get unlockedAt(): Date | null {
    return this._unlockedAt;
  }

  /**
   * Checks if the achievement condition is met.
   */
  checkCondition(stats: Statistics, gameData?: GameAchievementData): boolean {
    return this._checkCondition(stats, gameData);
  }

  /**
   * Unlocks the achievement.
   */
  unlock(): void {
    if (!this._isUnlocked) {
      this._isUnlocked = true;
      this._unlockedAt = new Date();
    }
  }

  /**
   * Resets the achievement.
   */
  reset(): void {
    this._isUnlocked = false;
    this._unlockedAt = null;
  }

  /**
   * Returns a serializable representation.
   */
  toJSON(): AchievementData {
    return {
      id: this._id,
      isUnlocked: this._isUnlocked,
      unlockedAt: this._unlockedAt?.toISOString() ?? null,
    };
  }

  /**
   * Restores achievement state from data.
   */
  fromData(data: AchievementData): void {
    this._isUnlocked = data.isUnlocked;
    this._unlockedAt = data.unlockedAt ? new Date(data.unlockedAt) : null;
  }
}

export interface AchievementConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  checkCondition: (
    stats: Statistics,
    gameData?: GameAchievementData,
  ) => boolean;
}

export interface AchievementData {
  id: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export interface GameAchievementData {
  won: boolean;
  timeTaken: number;
  difficulty: string;
  minesCleared: number;
}

// Predefined achievements
export const ACHIEVEMENT_CONFIGS: AchievementConfig[] = [
  {
    id: "first_blood",
    name: "First Blood",
    description: "Win your first game",
    icon: "🎉",
    checkCondition: (stats) => stats.wins >= 1,
  },
  {
    id: "mine_sweeper_master",
    name: "Mine Sweeper Master",
    description: "Clear 100 mines across all games",
    icon: "💣",
    checkCondition: (stats) => stats.totalMinesCleared >= 100,
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Clear a medium board in under 60 seconds",
    icon: "⚡",
    checkCondition: (stats, gameData) => {
      if (!gameData) return false;
      return (
        gameData.won &&
        gameData.difficulty === "medium" &&
        gameData.timeTaken < 60
      );
    },
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    description: "Win 10 games in a row",
    icon: "🏆",
    checkCondition: (stats) => stats.wins >= 10 && stats.successRate === 100,
  },
  {
    id: "veteran",
    name: "Veteran",
    description: "Play 50 games",
    icon: "🎖️",
    checkCondition: (stats) => stats.totalGamesPlayed >= 50,
  },
  {
    id: "time_lord",
    name: "Time Lord",
    description: "Spend over 1 hour playing",
    icon: "⏰",
    checkCondition: (stats) => stats.totalTimePlayed >= 3600,
  },
  {
    id: "beginner_luck",
    name: "Beginner's Luck",
    description: "Clear a small board in under 30 seconds",
    icon: "🍀",
    checkCondition: (stats, gameData) => {
      if (!gameData) return false;
      return (
        gameData.won &&
        gameData.difficulty === "small" &&
        gameData.timeTaken < 30
      );
    },
  },
  {
    id: "expert",
    name: "Expert",
    description: "Clear a large board",
    icon: "🧠",
    checkCondition: (stats, gameData) => {
      if (!gameData) return false;
      return gameData.won && gameData.difficulty === "large";
    },
  },
];
