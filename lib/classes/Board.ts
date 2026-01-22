import { Cell, CellData } from "./Cell";

/**
 * Class 2: Board
 * Represents the Minesweeper game board containing cells.
 */
export class Board {
  private _rows: number;
  private _cols: number;
  private _mineCount: number;
  private _cells: Cell[][];
  private _minesPlaced: boolean;

  constructor(rows: number, cols: number, mineCount: number) {
    this._rows = rows;
    this._cols = cols;
    this._mineCount = Math.min(mineCount, rows * cols - 1);
    this._cells = [];
    this._minesPlaced = false;
    this.initializeCells();
  }

  // Getters
  get rows(): number {
    return this._rows;
  }

  get cols(): number {
    return this._cols;
  }

  get mineCount(): number {
    return this._mineCount;
  }

  get cells(): Cell[][] {
    return this._cells;
  }

  get minesPlaced(): boolean {
    return this._minesPlaced;
  }

  /**
   * Initializes empty cells for the board.
   */
  private initializeCells(): void {
    this._cells = [];
    for (let row = 0; row < this._rows; row++) {
      this._cells[row] = [];
      for (let col = 0; col < this._cols; col++) {
        this._cells[row][col] = new Cell(row, col);
      }
    }
  }

  /**
   * Places mines randomly on the board, avoiding the first clicked cell.
   * @param excludeRow - Row to exclude from mine placement
   * @param excludeCol - Column to exclude from mine placement
   */
  placeMines(excludeRow: number, excludeCol: number): void {
    if (this._minesPlaced) return;

    const positions: { row: number; col: number }[] = [];

    // Collect all valid positions (excluding the clicked cell and its neighbors)
    for (let row = 0; row < this._rows; row++) {
      for (let col = 0; col < this._cols; col++) {
        const isExcluded =
          Math.abs(row - excludeRow) <= 1 && Math.abs(col - excludeCol) <= 1;
        if (!isExcluded) {
          positions.push({ row, col });
        }
      }
    }

    // Shuffle and pick mine positions
    this.shuffleArray(positions);
    const minePositions = positions.slice(
      0,
      Math.min(this._mineCount, positions.length),
    );

    // Place mines
    for (const pos of minePositions) {
      this._cells[pos.row][pos.col].hasMine = true;
    }

    // Calculate adjacent mine counts
    this.calculateAdjacentMines();
    this._minesPlaced = true;
  }

  /**
   * Fisher-Yates shuffle algorithm.
   */
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Calculates the number of adjacent mines for each cell.
   */
  private calculateAdjacentMines(): void {
    for (let row = 0; row < this._rows; row++) {
      for (let col = 0; col < this._cols; col++) {
        if (!this._cells[row][col].hasMine) {
          const count = this.countAdjacentMines(row, col);
          this._cells[row][col].adjacentMines = count;
        }
      }
    }
  }

  /**
   * Counts mines adjacent to a specific cell.
   */
  private countAdjacentMines(row: number, col: number): number {
    let count = 0;
    const neighbors = this.getNeighbors(row, col);
    for (const neighbor of neighbors) {
      if (neighbor.hasMine) {
        count++;
      }
    }
    return count;
  }

  /**
   * Gets all neighboring cells for a given position.
   */
  getNeighbors(row: number, col: number): Cell[] {
    const neighbors: Cell[] = [];
    for (let dRow = -1; dRow <= 1; dRow++) {
      for (let dCol = -1; dCol <= 1; dCol++) {
        if (dRow === 0 && dCol === 0) continue;
        const newRow = row + dRow;
        const newCol = col + dCol;
        if (this.isValidPosition(newRow, newCol)) {
          neighbors.push(this._cells[newRow][newCol]);
        }
      }
    }
    return neighbors;
  }

  /**
   * Checks if a position is within board bounds.
   */
  isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < this._rows && col >= 0 && col < this._cols;
  }

  /**
   * Gets a cell at the specified position.
   */
  getCell(row: number, col: number): Cell | null {
    if (!this.isValidPosition(row, col)) {
      return null;
    }
    return this._cells[row][col];
  }

  /**
   * Reveals a cell and performs flood-fill if needed.
   * @returns Array of revealed cells
   */
  revealCell(row: number, col: number): Cell[] {
    const cell = this.getCell(row, col);
    if (!cell || cell.isRevealed || cell.isFlagged) {
      return [];
    }

    const revealedCells: Cell[] = [];

    if (!this._minesPlaced) {
      this.placeMines(row, col);
    }

    this.floodReveal(row, col, revealedCells);
    return revealedCells;
  }

  /**
   * Recursively reveals cells using flood-fill algorithm.
   */
  private floodReveal(row: number, col: number, revealedCells: Cell[]): void {
    const cell = this.getCell(row, col);
    if (!cell || cell.isRevealed || cell.isFlagged) {
      return;
    }

    cell.reveal();
    revealedCells.push(cell);

    // If cell has no adjacent mines, reveal neighbors
    if (cell.adjacentMines === 0 && !cell.hasMine) {
      const neighbors = this.getNeighbors(row, col);
      for (const neighbor of neighbors) {
        this.floodReveal(neighbor.row, neighbor.col, revealedCells);
      }
    }
  }

  /**
   * Counts flagged cells adjacent to a specific cell.
   */
  countAdjacentFlags(row: number, col: number): number {
    let count = 0;
    const neighbors = this.getNeighbors(row, col);
    for (const neighbor of neighbors) {
      if (neighbor.isFlagged) {
        count++;
      }
    }
    return count;
  }

  /**
   * Performs chording on a revealed cell.
   * If the number of adjacent flags equals the cell's adjacent mine count,
   * reveals all unflagged neighbors. Returns revealed cells and whether a mine was hit.
   * @returns Object containing revealed cells and whether a mine was triggered
   */
  chordCell(
    row: number,
    col: number,
  ): { revealedCells: Cell[]; hitMine: boolean } {
    const cell = this.getCell(row, col);
    const result = { revealedCells: [] as Cell[], hitMine: false };

    // Chording only works on revealed cells with adjacent mines
    if (!cell || !cell.isRevealed || cell.adjacentMines === 0) {
      return result;
    }

    const adjacentFlags = this.countAdjacentFlags(row, col);

    // Only chord if flag count matches adjacent mine count
    if (adjacentFlags !== cell.adjacentMines) {
      return result;
    }

    // Reveal all unflagged neighbors
    const neighbors = this.getNeighbors(row, col);
    for (const neighbor of neighbors) {
      if (!neighbor.isRevealed && !neighbor.isFlagged) {
        if (neighbor.hasMine) {
          // Hit a mine - reveal it and mark as hit
          neighbor.reveal();
          result.revealedCells.push(neighbor);
          result.hitMine = true;
        } else {
          // Reveal the cell (with flood fill for 0s)
          const revealed = this.revealCell(neighbor.row, neighbor.col);
          result.revealedCells.push(...revealed);
        }
      }
    }

    // Recursive chording: check if any newly revealed cells can also be chorded
    if (!result.hitMine) {
      const cellsToCheck = [...result.revealedCells];
      const checked = new Set<string>();

      while (cellsToCheck.length > 0) {
        const checkCell = cellsToCheck.pop()!;
        const key = `${checkCell.row},${checkCell.col}`;

        if (checked.has(key)) continue;
        checked.add(key);

        // Only check cells that have adjacent mines (numbered cells)
        if (checkCell.adjacentMines > 0) {
          const checkFlags = this.countAdjacentFlags(
            checkCell.row,
            checkCell.col,
          );

          if (checkFlags === checkCell.adjacentMines) {
            const checkNeighbors = this.getNeighbors(
              checkCell.row,
              checkCell.col,
            );

            for (const neighbor of checkNeighbors) {
              if (!neighbor.isRevealed && !neighbor.isFlagged) {
                if (neighbor.hasMine) {
                  neighbor.reveal();
                  result.revealedCells.push(neighbor);
                  result.hitMine = true;
                  return result; // Stop immediately on mine hit
                } else {
                  const revealed = this.revealCell(neighbor.row, neighbor.col);
                  result.revealedCells.push(...revealed);
                  cellsToCheck.push(...revealed);
                }
              }
            }
          }
        }
      }
    }

    return result;
  }

  /**
   * Reveals all mines on the board (for game over).
   */
  revealAllMines(): Cell[] {
    const mines: Cell[] = [];
    for (let row = 0; row < this._rows; row++) {
      for (let col = 0; col < this._cols; col++) {
        const cell = this._cells[row][col];
        if (cell.hasMine && !cell.isRevealed) {
          cell.reveal();
          mines.push(cell);
        }
      }
    }
    return mines;
  }

  /**
   * Counts the number of flagged cells.
   */
  getFlagCount(): number {
    let count = 0;
    for (let row = 0; row < this._rows; row++) {
      for (let col = 0; col < this._cols; col++) {
        if (this._cells[row][col].isFlagged) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Counts unrevealed non-mine cells.
   */
  getUnrevealedSafeCells(): number {
    let count = 0;
    for (let row = 0; row < this._rows; row++) {
      for (let col = 0; col < this._cols; col++) {
        const cell = this._cells[row][col];
        if (!cell.hasMine && !cell.isRevealed) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Gets the total number of revealed cells.
   */
  getRevealedCount(): number {
    let count = 0;
    for (let row = 0; row < this._rows; row++) {
      for (let col = 0; col < this._cols; col++) {
        if (this._cells[row][col].isRevealed) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Resets the board.
   */
  reset(): void {
    this._minesPlaced = false;
    this.initializeCells();
  }

  /**
   * Returns a serializable representation of the board.
   */
  toJSON(): BoardData {
    return {
      rows: this._rows,
      cols: this._cols,
      mineCount: this._mineCount,
      minesPlaced: this._minesPlaced,
      cells: this._cells.map((row) => row.map((cell) => cell.toJSON())),
    };
  }

  /**
   * Creates a Board from serialized data.
   */
  static fromJSON(data: BoardData): Board {
    const board = new Board(data.rows, data.cols, data.mineCount);
    board._minesPlaced = data.minesPlaced;
    board._cells = data.cells.map((row) =>
      row.map((cellData) => Cell.fromJSON(cellData)),
    );
    return board;
  }
}

export interface BoardData {
  rows: number;
  cols: number;
  mineCount: number;
  minesPlaced: boolean;
  cells: CellData[][];
}

// Preset board configurations
export const BOARD_PRESETS = {
  small: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  large: { rows: 16, cols: 30, mines: 99 },
} as const;

export type BoardPreset = keyof typeof BOARD_PRESETS;

// Custom board configuration
export interface CustomBoardConfig {
  rows: number;
  cols: number;
  mines: number;
}
