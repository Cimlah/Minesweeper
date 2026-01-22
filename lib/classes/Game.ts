import { Board, BoardData, BoardPreset, BOARD_PRESETS } from "./Board";
import { Timer } from "./Timer";
import {
  GameMode,
  GameModeType,
  GAME_MODES,
  TIME_ATTACK_LIMITS,
} from "./GameMode";
import { Player } from "./Player";
import { TimeFreezePowerUp } from "./TimeFreezePowerUp";
import { ShieldPowerUp } from "./ShieldPowerUp";
import { Cell } from "./Cell";

/**
 * Class 13: Game
 * Main game controller that orchestrates all game elements.
 */
export enum GameState {
  IDLE = "idle",
  PLAYING = "playing",
  WON = "won",
  LOST = "lost",
  PAUSED = "paused",
}

export class Game {
  private _board: Board;
  private _timer: Timer;
  private _gameMode: GameMode;
  private _state: GameState;
  private _difficulty: BoardPreset | "custom";
  private _player: Player | null;
  private _timeFreeze: TimeFreezePowerUp;
  private _shield: ShieldPowerUp;
  private _onStateChange: ((state: GameState) => void) | null;
  private _onCellUpdate: ((cells: Cell[]) => void) | null;
  private _onTimerUpdate: ((seconds: number) => void) | null;

  constructor(
    rows: number = BOARD_PRESETS.small.rows,
    cols: number = BOARD_PRESETS.small.cols,
    mines: number = BOARD_PRESETS.small.mines,
    difficulty: BoardPreset | "custom" = "small",
  ) {
    this._board = new Board(rows, cols, mines);
    this._timer = new Timer();
    this._gameMode = GAME_MODES[GameModeType.CLASSIC];
    this._state = GameState.IDLE;
    this._difficulty = difficulty;
    this._player = null;
    this._timeFreeze = new TimeFreezePowerUp();
    this._shield = new ShieldPowerUp();
    this._onStateChange = null;
    this._onCellUpdate = null;
    this._onTimerUpdate = null;

    this.setupPowerUps();
    this.setupTimer();
  }

  // Getters
  get board(): Board {
    return this._board;
  }

  get timer(): Timer {
    return this._timer;
  }

  get gameMode(): GameMode {
    return this._gameMode;
  }

  get state(): GameState {
    return this._state;
  }

  get difficulty(): BoardPreset | "custom" {
    return this._difficulty;
  }

  get player(): Player | null {
    return this._player;
  }

  get timeFreeze(): TimeFreezePowerUp {
    return this._timeFreeze;
  }

  get shield(): ShieldPowerUp {
    return this._shield;
  }

  get isGameOver(): boolean {
    return this._state === GameState.WON || this._state === GameState.LOST;
  }

  get minesRemaining(): number {
    return this._board.mineCount - this._board.getFlagCount();
  }

  /**
   * Sets up power-up callbacks.
   */
  private setupPowerUps(): void {
    this._timeFreeze.setOnFreeze(() => {
      this._timer.pause();
    });

    this._timeFreeze.setOnUnfreeze(() => {
      if (this._state === GameState.PLAYING) {
        this._timer.resume();
      }
    });

    this._shield.setOnShieldActivate(() => {
      // Shield activated notification can be handled via state
    });

    this._shield.setOnShieldBreak(() => {
      // Shield broken notification can be handled via state
    });
  }

  /**
   * Sets up timer callbacks.
   */
  private setupTimer(): void {
    this._timer.setOnTick((seconds) => {
      if (this._onTimerUpdate) {
        this._onTimerUpdate(seconds);
      }

      // Check time attack mode expiration
      if (
        this._gameMode.hasTimeLimit() &&
        this._gameMode.isTimeExpired(seconds)
      ) {
        this.endGame(false);
      }
    });
  }

  /**
   * Sets the player for the game.
   */
  setPlayer(player: Player): void {
    this._player = player;
  }

  /**
   * Sets the game mode.
   */
  setGameMode(modeType: GameModeType): void {
    this._gameMode = GAME_MODES[modeType];

    // Update time limit for time attack based on difficulty
    if (
      modeType === GameModeType.TIME_ATTACK &&
      this._difficulty !== "custom"
    ) {
      const timeLimit =
        TIME_ATTACK_LIMITS[this._difficulty as keyof typeof TIME_ATTACK_LIMITS];
      this._gameMode = new GameMode({
        ...this._gameMode.toJSON(),
        timeLimit,
      });
    }
  }

  /**
   * Sets event callbacks.
   */
  setCallbacks(callbacks: {
    onStateChange?: (state: GameState) => void;
    onCellUpdate?: (cells: Cell[]) => void;
    onTimerUpdate?: (seconds: number) => void;
  }): void {
    this._onStateChange = callbacks.onStateChange ?? null;
    this._onCellUpdate = callbacks.onCellUpdate ?? null;
    this._onTimerUpdate = callbacks.onTimerUpdate ?? null;
  }

  /**
   * Updates the game state.
   */
  private setState(state: GameState): void {
    this._state = state;
    if (this._onStateChange) {
      this._onStateChange(state);
    }
  }

  /**
   * Reveals a cell on the board.
   */
  revealCell(row: number, col: number): boolean {
    if (this.isGameOver) {
      return false;
    }

    const cell = this._board.getCell(row, col);
    if (!cell || cell.isRevealed || cell.isFlagged) {
      return false;
    }

    // Start game on first click
    if (this._state === GameState.IDLE) {
      this.startGame();
    }

    // Check if cell has a mine
    if (cell.hasMine) {
      // Try to use shield
      if (this._shield.isActive && this._shield.useShield()) {
        // Shield protected the player, mark cell as flagged instead
        cell.toggleFlag();
        if (this._onCellUpdate) {
          this._onCellUpdate([cell]);
        }
        return true;
      }

      // Game over - reveal the mine and end game
      cell.reveal();
      this._board.revealAllMines();
      this.endGame(false);
      return true;
    }

    // Reveal cell and flood fill
    const revealedCells = this._board.revealCell(row, col);

    if (this._onCellUpdate) {
      this._onCellUpdate(revealedCells);
    }

    // Check win condition
    if (this._board.getUnrevealedSafeCells() === 0) {
      this.endGame(true);
    }

    return true;
  }

  /**
   * Toggles a flag on a cell.
   */
  toggleFlag(row: number, col: number): boolean {
    if (this.isGameOver) {
      return false;
    }

    const cell = this._board.getCell(row, col);
    if (!cell || cell.isRevealed) {
      return false;
    }

    cell.toggleFlag();

    if (this._onCellUpdate) {
      this._onCellUpdate([cell]);
    }

    return true;
  }

  /**
   * Performs chording on a revealed cell.
   * If the cell is revealed and the number of adjacent flags equals its number,
   * all unflagged neighbors are revealed. This cascades recursively.
   */
  chordCell(row: number, col: number): boolean {
    if (this.isGameOver) {
      return false;
    }

    const cell = this._board.getCell(row, col);
    if (!cell || !cell.isRevealed) {
      return false;
    }

    // Start game if not started (shouldn't happen with chording, but safety check)
    if (this._state === GameState.IDLE) {
      this.startGame();
    }

    const result = this._board.chordCell(row, col);

    if (result.revealedCells.length > 0) {
      if (this._onCellUpdate) {
        this._onCellUpdate(result.revealedCells);
      }

      if (result.hitMine) {
        // Game over - reveal all mines
        this._board.revealAllMines();
        this.endGame(false);
        return true;
      }

      // Check win condition
      if (this._board.getUnrevealedSafeCells() === 0) {
        this.endGame(true);
      }
    }

    return true;
  }

  /**
   * Starts the game.
   */
  private startGame(): void {
    this.setState(GameState.PLAYING);
    this._timer.start();
  }

  /**
   * Ends the game.
   */
  private endGame(won: boolean): void {
    this._timer.stop();
    this.setState(won ? GameState.WON : GameState.LOST);

    // Record game result for player
    if (this._player) {
      const timeTaken = this._timer.getElapsedSeconds();
      const minesCleared = won ? this._board.mineCount : 0;
      this._player.recordGame(
        won,
        timeTaken,
        minesCleared,
        this._difficulty,
        this._gameMode.bonusMultiplier,
      );
      this._player.save();
    }
  }

  /**
   * Pauses the game.
   */
  pause(): void {
    if (this._state === GameState.PLAYING) {
      this.setState(GameState.PAUSED);
      this._timer.pause();
    }
  }

  /**
   * Resumes the game.
   */
  resume(): void {
    if (this._state === GameState.PAUSED) {
      this.setState(GameState.PLAYING);
      this._timer.resume();
    }
  }

  /**
   * Resets the game with new configuration.
   */
  reset(
    rows?: number,
    cols?: number,
    mines?: number,
    difficulty?: BoardPreset | "custom",
  ): void {
    const preset =
      difficulty && difficulty !== "custom" ? BOARD_PRESETS[difficulty] : null;

    const newRows = rows ?? preset?.rows ?? this._board.rows;
    const newCols = cols ?? preset?.cols ?? this._board.cols;
    const newMines = mines ?? preset?.mines ?? this._board.mineCount;

    this._board = new Board(newRows, newCols, newMines);
    this._timer.reset();
    this._timeFreeze.reset();
    this._shield.reset();
    this._difficulty = difficulty ?? this._difficulty;
    this.setState(GameState.IDLE);

    // Update time limit for time attack
    if (this._gameMode.type === GameModeType.TIME_ATTACK) {
      this.setGameMode(GameModeType.TIME_ATTACK);
    }
  }

  /**
   * Uses the time freeze power-up.
   */
  useTimeFreeze(): boolean {
    if (this._state !== GameState.PLAYING) {
      return false;
    }
    return this._timeFreeze.activate();
  }

  /**
   * Uses the shield power-up.
   */
  useShield(): boolean {
    if (this._state !== GameState.PLAYING) {
      return false;
    }
    return this._shield.activate();
  }

  /**
   * Gets the current game data for display.
   */
  getGameData(): GameDisplayData {
    return {
      state: this._state,
      elapsedTime: this._timer.getElapsedSeconds(),
      remainingTime: this._gameMode.getRemainingTime(
        this._timer.getElapsedSeconds(),
      ),
      minesRemaining: this.minesRemaining,
      difficulty: this._difficulty,
      gameMode: this._gameMode.type,
      timeFreezesRemaining: this._timeFreeze.usesRemaining,
      shieldsRemaining: this._shield.usesRemaining,
      shieldActive: this._shield.isActive,
      timeFrozen: this._timeFreeze.isActive,
    };
  }

  /**
   * Returns a serializable representation.
   */
  toJSON(): GameData {
    return {
      board: this._board.toJSON(),
      timer: this._timer.toJSON(),
      gameMode: this._gameMode.type,
      state: this._state,
      difficulty: this._difficulty,
      timeFreeze: this._timeFreeze.toJSON(),
      shield: this._shield.toJSON(),
    };
  }

  /**
   * Creates a Game from serialized data.
   */
  static fromJSON(data: GameData): Game {
    const board = Board.fromJSON(data.board);
    const game = new Game(
      board.rows,
      board.cols,
      board.mineCount,
      data.difficulty,
    );
    game._board = board;
    game._state = data.state;
    game.setGameMode(data.gameMode);
    return game;
  }

  /**
   * Creates a game with a preset difficulty.
   */
  static createWithPreset(preset: BoardPreset): Game {
    const config = BOARD_PRESETS[preset];
    return new Game(config.rows, config.cols, config.mines, preset);
  }
}

export interface GameData {
  board: BoardData;
  timer: ReturnType<Timer["toJSON"]>;
  gameMode: GameModeType;
  state: GameState;
  difficulty: BoardPreset | "custom";
  timeFreeze: ReturnType<TimeFreezePowerUp["toJSON"]>;
  shield: ReturnType<ShieldPowerUp["toJSON"]>;
}

export interface GameDisplayData {
  state: GameState;
  elapsedTime: number;
  remainingTime: number | null;
  minesRemaining: number;
  difficulty: BoardPreset | "custom";
  gameMode: GameModeType;
  timeFreezesRemaining: number;
  shieldsRemaining: number;
  shieldActive: boolean;
  timeFrozen: boolean;
}
