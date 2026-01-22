/**
 * Class 3: Timer
 * Handles game timer functionality.
 */
export class Timer {
  private _startTime: number | null;
  private _endTime: number | null;
  private _pausedTime: number;
  private _isPaused: boolean;
  private _isFrozen: boolean;
  private _frozenUntil: number | null;
  private _intervalId: ReturnType<typeof setInterval> | null;
  private _onTick: ((seconds: number) => void) | null;

  constructor() {
    this._startTime = null;
    this._endTime = null;
    this._pausedTime = 0;
    this._isPaused = false;
    this._isFrozen = false;
    this._frozenUntil = null;
    this._intervalId = null;
    this._onTick = null;
  }

  // Getters
  get isRunning(): boolean {
    return (
      this._startTime !== null && this._endTime === null && !this._isPaused
    );
  }

  get isPaused(): boolean {
    return this._isPaused;
  }

  get isFrozen(): boolean {
    return (
      this._isFrozen &&
      this._frozenUntil !== null &&
      Date.now() < this._frozenUntil
    );
  }

  /**
   * Gets elapsed time in seconds.
   */
  getElapsedSeconds(): number {
    if (this._startTime === null) {
      return 0;
    }

    let endPoint: number;
    if (this._endTime !== null) {
      endPoint = this._endTime;
    } else if (this._isPaused) {
      endPoint = this._pausedTime;
    } else {
      endPoint = Date.now();
    }

    return Math.floor((endPoint - this._startTime) / 1000);
  }

  /**
   * Gets elapsed time in milliseconds.
   */
  getElapsedMilliseconds(): number {
    if (this._startTime === null) {
      return 0;
    }

    let endPoint: number;
    if (this._endTime !== null) {
      endPoint = this._endTime;
    } else if (this._isPaused) {
      endPoint = this._pausedTime;
    } else {
      endPoint = Date.now();
    }

    return endPoint - this._startTime;
  }

  /**
   * Starts the timer.
   */
  start(): void {
    if (this._startTime === null) {
      this._startTime = Date.now();
      this._endTime = null;
      this._isPaused = false;
      this.startInterval();
    }
  }

  /**
   * Stops the timer.
   */
  stop(): void {
    if (this._startTime !== null && this._endTime === null) {
      this._endTime = Date.now();
      this.stopInterval();
    }
  }

  /**
   * Pauses the timer.
   */
  pause(): void {
    if (this.isRunning) {
      this._pausedTime = Date.now();
      this._isPaused = true;
      this.stopInterval();
    }
  }

  /**
   * Resumes the timer from pause.
   */
  resume(): void {
    if (this._isPaused && this._startTime !== null) {
      const pauseDuration = Date.now() - this._pausedTime;
      this._startTime += pauseDuration;
      this._isPaused = false;
      this.startInterval();
    }
  }

  /**
   * Freezes the timer for a specified duration (power-up).
   * @param durationMs - Duration in milliseconds
   */
  freeze(durationMs: number): void {
    this._isFrozen = true;
    this._frozenUntil = Date.now() + durationMs;
    this.pause();

    setTimeout(() => {
      this._isFrozen = false;
      this._frozenUntil = null;
      this.resume();
    }, durationMs);
  }

  /**
   * Resets the timer.
   */
  reset(): void {
    this.stopInterval();
    this._startTime = null;
    this._endTime = null;
    this._pausedTime = 0;
    this._isPaused = false;
    this._isFrozen = false;
    this._frozenUntil = null;
  }

  /**
   * Sets the tick callback function.
   */
  setOnTick(callback: (seconds: number) => void): void {
    this._onTick = callback;
  }

  /**
   * Starts the interval for tick updates.
   */
  private startInterval(): void {
    if (this._intervalId === null) {
      this._intervalId = setInterval(() => {
        if (this._onTick && !this._isPaused) {
          this._onTick(this.getElapsedSeconds());
        }
      }, 1000);
    }
  }

  /**
   * Stops the interval.
   */
  private stopInterval(): void {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  /**
   * Formats seconds to MM:SS format.
   */
  static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  /**
   * Returns a serializable representation of the timer.
   */
  toJSON(): TimerData {
    return {
      elapsedMs: this.getElapsedMilliseconds(),
      isRunning: this.isRunning,
    };
  }
}

export interface TimerData {
  elapsedMs: number;
  isRunning: boolean;
}
