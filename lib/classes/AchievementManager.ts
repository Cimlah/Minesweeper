import {
  Achievement,
  AchievementConfig,
  AchievementData,
  GameAchievementData,
  ACHIEVEMENT_CONFIGS,
} from "./Achievement";
import { Statistics } from "./Statistics";

/**
 * Class 7: AchievementManager
 * Manages all achievements and their unlocking.
 */
export class AchievementManager {
  private _achievements: Map<string, Achievement>;
  private _recentlyUnlocked: Achievement[];

  constructor() {
    this._achievements = new Map();
    this._recentlyUnlocked = [];
    this.initializeAchievements();
  }

  // Getters
  get achievements(): Achievement[] {
    return Array.from(this._achievements.values());
  }

  get unlockedAchievements(): Achievement[] {
    return this.achievements.filter((a) => a.isUnlocked);
  }

  get lockedAchievements(): Achievement[] {
    return this.achievements.filter((a) => !a.isUnlocked);
  }

  get recentlyUnlocked(): Achievement[] {
    return [...this._recentlyUnlocked];
  }

  get progress(): number {
    const total = this._achievements.size;
    if (total === 0) return 0;
    return Math.round((this.unlockedAchievements.length / total) * 100);
  }

  /**
   * Initializes achievements from predefined configs.
   */
  private initializeAchievements(): void {
    for (const config of ACHIEVEMENT_CONFIGS) {
      this._achievements.set(config.id, new Achievement(config));
    }
  }

  /**
   * Gets an achievement by ID.
   */
  getAchievement(id: string): Achievement | undefined {
    return this._achievements.get(id);
  }

  /**
   * Checks and unlocks achievements based on current stats.
   * @returns Newly unlocked achievements
   */
  checkAchievements(
    stats: Statistics,
    gameData?: GameAchievementData,
  ): Achievement[] {
    this._recentlyUnlocked = [];

    for (const achievement of this._achievements.values()) {
      if (
        !achievement.isUnlocked &&
        achievement.checkCondition(stats, gameData)
      ) {
        achievement.unlock();
        this._recentlyUnlocked.push(achievement);
      }
    }

    return this._recentlyUnlocked;
  }

  /**
   * Clears the recently unlocked list.
   */
  clearRecentlyUnlocked(): void {
    this._recentlyUnlocked = [];
  }

  /**
   * Adds a custom achievement.
   */
  addAchievement(config: AchievementConfig): void {
    if (!this._achievements.has(config.id)) {
      this._achievements.set(config.id, new Achievement(config));
    }
  }

  /**
   * Resets all achievements.
   */
  reset(): void {
    for (const achievement of this._achievements.values()) {
      achievement.reset();
    }
    this._recentlyUnlocked = [];
  }

  /**
   * Returns a serializable representation.
   */
  toJSON(): AchievementManagerData {
    return {
      achievements: Array.from(this._achievements.values()).map((a) =>
        a.toJSON(),
      ),
    };
  }

  /**
   * Loads achievement states from data.
   */
  loadFromData(data: AchievementManagerData): void {
    for (const achievementData of data.achievements) {
      const achievement = this._achievements.get(achievementData.id);
      if (achievement) {
        achievement.fromData(achievementData);
      }
    }
  }

  /**
   * Creates an AchievementManager from saved data.
   */
  static fromJSON(data: AchievementManagerData): AchievementManager {
    const manager = new AchievementManager();
    manager.loadFromData(data);
    return manager;
  }
}

export interface AchievementManagerData {
  achievements: AchievementData[];
}
