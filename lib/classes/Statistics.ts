/**
 * Class 5: Statistics
 * Tracks player statistics for the game.
 */
export class Statistics {
  private _totalGamesPlayed: number;
  private _wins: number;
  private _losses: number;
  private _totalTimePlayed: number; // in seconds
  private _fastestClearTime: number | null; // in seconds
  private _totalMinesCleared: number;
  private _fastestTimeByDifficulty: Record<string, number | null>;

  constructor(data?: StatisticsData) {
    this._totalGamesPlayed = data?.totalGamesPlayed ?? 0;
    this._wins = data?.wins ?? 0;
    this._losses = data?.losses ?? 0;
    this._totalTimePlayed = data?.totalTimePlayed ?? 0;
    this._fastestClearTime = data?.fastestClearTime ?? null;
    this._totalMinesCleared = data?.totalMinesCleared ?? 0;
    this._fastestTimeByDifficulty = data?.fastestTimeByDifficulty ?? {
      small: null,
      medium: null,
      large: null,
    };
  }

  // Getters
  get totalGamesPlayed(): number {
    return this._totalGamesPlayed;
  }

  get wins(): number {
    return this._wins;
  }

  get losses(): number {
    return this._losses;
  }

  get totalTimePlayed(): number {
    return this._totalTimePlayed;
  }

  get fastestClearTime(): number | null {
    return this._fastestClearTime;
  }

  get totalMinesCleared(): number {
    return this._totalMinesCleared;
  }

  get successRate(): number {
    if (this._totalGamesPlayed === 0) {
      return 0;
    }
    return Math.round((this._wins / this._totalGamesPlayed) * 100);
  }

  /**
   * Records a game win.
   */
  recordWin(
    timeTaken: number,
    minesCleared: number,
    difficulty?: string,
  ): void {
    this._totalGamesPlayed++;
    this._wins++;
    this._totalTimePlayed += timeTaken;
    this._totalMinesCleared += minesCleared;

    // Update fastest time
    if (this._fastestClearTime === null || timeTaken < this._fastestClearTime) {
      this._fastestClearTime = timeTaken;
    }

    // Update fastest time by difficulty
    if (difficulty && difficulty in this._fastestTimeByDifficulty) {
      const currentFastest = this._fastestTimeByDifficulty[difficulty];
      if (currentFastest === null || timeTaken < currentFastest) {
        this._fastestTimeByDifficulty[difficulty] = timeTaken;
      }
    }
  }

  /**
   * Records a game loss.
   */
  recordLoss(timeTaken: number): void {
    this._totalGamesPlayed++;
    this._losses++;
    this._totalTimePlayed += timeTaken;
  }

  /**
   * Gets the fastest time for a specific difficulty.
   */
  getFastestTimeByDifficulty(difficulty: string): number | null {
    return this._fastestTimeByDifficulty[difficulty] ?? null;
  }

  /**
   * Formats time in a human-readable format.
   */
  static formatPlayTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }

  /**
   * Resets all statistics.
   */
  reset(): void {
    this._totalGamesPlayed = 0;
    this._wins = 0;
    this._losses = 0;
    this._totalTimePlayed = 0;
    this._fastestClearTime = null;
    this._totalMinesCleared = 0;
    this._fastestTimeByDifficulty = {
      small: null,
      medium: null,
      large: null,
    };
  }

  /**
   * Returns a serializable representation.
   */
  toJSON(): StatisticsData {
    return {
      totalGamesPlayed: this._totalGamesPlayed,
      wins: this._wins,
      losses: this._losses,
      totalTimePlayed: this._totalTimePlayed,
      fastestClearTime: this._fastestClearTime,
      totalMinesCleared: this._totalMinesCleared,
      fastestTimeByDifficulty: { ...this._fastestTimeByDifficulty },
    };
  }

  /**
   * Creates Statistics from serialized data.
   */
  static fromJSON(data: StatisticsData): Statistics {
    return new Statistics(data);
  }
}

export interface StatisticsData {
  totalGamesPlayed: number;
  wins: number;
  losses: number;
  totalTimePlayed: number;
  fastestClearTime: number | null;
  totalMinesCleared: number;
  fastestTimeByDifficulty: Record<string, number | null>;
}
