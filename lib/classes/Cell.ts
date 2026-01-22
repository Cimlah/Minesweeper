/**
 * Class 1: Cell
 * Represents a single cell on the Minesweeper board.
 */
export class Cell {
  private _row: number;
  private _col: number;
  private _hasMine: boolean;
  private _isRevealed: boolean;
  private _isFlagged: boolean;
  private _adjacentMines: number;

  constructor(row: number, col: number) {
    this._row = row;
    this._col = col;
    this._hasMine = false;
    this._isRevealed = false;
    this._isFlagged = false;
    this._adjacentMines = 0;
  }

  // Getters
  get row(): number {
    return this._row;
  }

  get col(): number {
    return this._col;
  }

  get hasMine(): boolean {
    return this._hasMine;
  }

  get isRevealed(): boolean {
    return this._isRevealed;
  }

  get isFlagged(): boolean {
    return this._isFlagged;
  }

  get adjacentMines(): number {
    return this._adjacentMines;
  }

  // Setters
  set hasMine(value: boolean) {
    this._hasMine = value;
  }

  set adjacentMines(value: number) {
    this._adjacentMines = value;
  }

  /**
   * Reveals the cell if not flagged.
   * @returns true if the cell was revealed, false if flagged or already revealed
   */
  reveal(): boolean {
    if (this._isFlagged || this._isRevealed) {
      return false;
    }
    this._isRevealed = true;
    return true;
  }

  /**
   * Toggles the flag state of the cell.
   * @returns true if the cell is now flagged, false if unflagged
   */
  toggleFlag(): boolean {
    if (this._isRevealed) {
      return false;
    }
    this._isFlagged = !this._isFlagged;
    return this._isFlagged;
  }

  /**
   * Resets the cell to its initial state.
   */
  reset(): void {
    this._hasMine = false;
    this._isRevealed = false;
    this._isFlagged = false;
    this._adjacentMines = 0;
  }

  /**
   * Returns a serializable representation of the cell.
   */
  toJSON(): CellData {
    return {
      row: this._row,
      col: this._col,
      hasMine: this._hasMine,
      isRevealed: this._isRevealed,
      isFlagged: this._isFlagged,
      adjacentMines: this._adjacentMines,
    };
  }

  /**
   * Creates a Cell from serialized data.
   */
  static fromJSON(data: CellData): Cell {
    const cell = new Cell(data.row, data.col);
    cell._hasMine = data.hasMine;
    cell._isRevealed = data.isRevealed;
    cell._isFlagged = data.isFlagged;
    cell._adjacentMines = data.adjacentMines;
    return cell;
  }
}

export interface CellData {
  row: number;
  col: number;
  hasMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}
