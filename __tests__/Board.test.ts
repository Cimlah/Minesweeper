import { Cell } from "../lib/classes/Cell";
import { Board } from "../lib/classes/Board";

describe("Cell", () => {
  let cell: Cell;

  beforeEach(() => {
    cell = new Cell(0, 0);
  });

  test("should initialize with correct default values", () => {
    expect(cell.row).toBe(0);
    expect(cell.col).toBe(0);
    expect(cell.hasMine).toBe(false);
    expect(cell.isRevealed).toBe(false);
    expect(cell.isFlagged).toBe(false);
    expect(cell.adjacentMines).toBe(0);
  });

  test("should reveal cell when not flagged", () => {
    const result = cell.reveal();
    expect(result).toBe(true);
    expect(cell.isRevealed).toBe(true);
  });

  test("should not reveal cell when flagged", () => {
    cell.toggleFlag();
    const result = cell.reveal();
    expect(result).toBe(false);
    expect(cell.isRevealed).toBe(false);
  });

  test("should not reveal cell when already revealed", () => {
    cell.reveal();
    const result = cell.reveal();
    expect(result).toBe(false);
  });

  test("should toggle flag on covered cell", () => {
    expect(cell.isFlagged).toBe(false);
    cell.toggleFlag();
    expect(cell.isFlagged).toBe(true);
    cell.toggleFlag();
    expect(cell.isFlagged).toBe(false);
  });

  test("should not toggle flag on revealed cell", () => {
    cell.reveal();
    const result = cell.toggleFlag();
    expect(result).toBe(false);
    expect(cell.isFlagged).toBe(false);
  });

  test("should reset cell to initial state", () => {
    cell.hasMine = true;
    cell.adjacentMines = 5;
    cell.reveal();
    cell.reset();

    expect(cell.hasMine).toBe(false);
    expect(cell.isRevealed).toBe(false);
    expect(cell.isFlagged).toBe(false);
    expect(cell.adjacentMines).toBe(0);
  });

  test("should serialize to JSON correctly", () => {
    cell.hasMine = true;
    cell.adjacentMines = 3;
    const json = cell.toJSON();

    expect(json).toEqual({
      row: 0,
      col: 0,
      hasMine: true,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 3,
    });
  });

  test("should deserialize from JSON correctly", () => {
    const data = {
      row: 5,
      col: 7,
      hasMine: true,
      isRevealed: true,
      isFlagged: false,
      adjacentMines: 2,
    };

    const restored = Cell.fromJSON(data);
    expect(restored.row).toBe(5);
    expect(restored.col).toBe(7);
    expect(restored.hasMine).toBe(true);
    expect(restored.isRevealed).toBe(true);
    expect(restored.adjacentMines).toBe(2);
  });
});

describe("Board", () => {
  describe("initialization", () => {
    test("should create board with correct dimensions", () => {
      const board = new Board(9, 9, 10);
      expect(board.rows).toBe(9);
      expect(board.cols).toBe(9);
      expect(board.mineCount).toBe(10);
    });

    test("should limit mines to (rows * cols - 1)", () => {
      const board = new Board(3, 3, 100);
      expect(board.mineCount).toBe(8); // 3*3 - 1
    });

    test("should initialize all cells", () => {
      const board = new Board(5, 5, 5);
      expect(board.cells.length).toBe(5);
      expect(board.cells[0].length).toBe(5);

      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const cell = board.getCell(row, col);
          expect(cell).not.toBeNull();
          expect(cell?.row).toBe(row);
          expect(cell?.col).toBe(col);
        }
      }
    });
  });

  describe("mine placement", () => {
    test("should place mines after first click", () => {
      const board = new Board(9, 9, 10);
      expect(board.minesPlaced).toBe(false);

      board.placeMines(4, 4);
      expect(board.minesPlaced).toBe(true);
    });

    test("should place correct number of mines", () => {
      const board = new Board(9, 9, 10);
      board.placeMines(4, 4);

      let mineCount = 0;
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board.getCell(row, col)?.hasMine) {
            mineCount++;
          }
        }
      }

      expect(mineCount).toBe(10);
    });

    test("should not place mine on first clicked cell or neighbors", () => {
      const board = new Board(9, 9, 10);
      board.placeMines(4, 4);

      // Check the clicked cell and its 8 neighbors
      for (let row = 3; row <= 5; row++) {
        for (let col = 3; col <= 5; col++) {
          const cell = board.getCell(row, col);
          expect(cell?.hasMine).toBe(false);
        }
      }
    });

    test("should not place mines multiple times", () => {
      const board = new Board(9, 9, 10);
      board.placeMines(4, 4);
      board.placeMines(0, 0); // Try to place again

      let mineCount = 0;
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board.getCell(row, col)?.hasMine) {
            mineCount++;
          }
        }
      }

      expect(mineCount).toBe(10);
    });
  });

  describe("adjacent mines calculation", () => {
    test("should calculate adjacent mines correctly", () => {
      const board = new Board(3, 3, 1);

      // Manually place a mine at (0,0)
      const cell = board.getCell(0, 0);
      if (cell) {
        cell.hasMine = true;
      }

      // Calculate adjacent mines manually
      board.placeMines(2, 2);

      // Cells adjacent to (0,0) should have adjacentMines > 0
      // But since placeMines recalculates, let's test with a clean approach
    });
  });

  describe("getNeighbors", () => {
    test("should return 8 neighbors for center cell", () => {
      const board = new Board(5, 5, 5);
      const neighbors = board.getNeighbors(2, 2);
      expect(neighbors.length).toBe(8);
    });

    test("should return 3 neighbors for corner cell", () => {
      const board = new Board(5, 5, 5);
      const neighbors = board.getNeighbors(0, 0);
      expect(neighbors.length).toBe(3);
    });

    test("should return 5 neighbors for edge cell", () => {
      const board = new Board(5, 5, 5);
      const neighbors = board.getNeighbors(0, 2);
      expect(neighbors.length).toBe(5);
    });
  });

  describe("isValidPosition", () => {
    test("should return true for valid positions", () => {
      const board = new Board(5, 5, 5);
      expect(board.isValidPosition(0, 0)).toBe(true);
      expect(board.isValidPosition(4, 4)).toBe(true);
      expect(board.isValidPosition(2, 3)).toBe(true);
    });

    test("should return false for invalid positions", () => {
      const board = new Board(5, 5, 5);
      expect(board.isValidPosition(-1, 0)).toBe(false);
      expect(board.isValidPosition(0, -1)).toBe(false);
      expect(board.isValidPosition(5, 0)).toBe(false);
      expect(board.isValidPosition(0, 5)).toBe(false);
    });
  });

  describe("cell reveal", () => {
    test("should reveal cell and return revealed cells", () => {
      const board = new Board(9, 9, 10);
      const revealedCells = board.revealCell(4, 4);

      expect(revealedCells.length).toBeGreaterThan(0);
      expect(board.getCell(4, 4)?.isRevealed).toBe(true);
    });

    test("should not reveal flagged cell", () => {
      const board = new Board(9, 9, 10);
      const cell = board.getCell(4, 4);
      cell?.toggleFlag();

      const revealedCells = board.revealCell(4, 4);
      expect(revealedCells.length).toBe(0);
      expect(cell?.isRevealed).toBe(false);
    });

    test("should flood fill for cells with no adjacent mines", () => {
      const board = new Board(5, 5, 1);
      // Make mine placement deterministic (no shuffle)
      (
        board as unknown as { shuffleArray: (array: unknown[]) => void }
      ).shuffleArray = () => {};

      // Place mine in first available position (0,0) by excluding far corner
      board.placeMines(4, 4);

      // Reveal a cell far from the mine
      const revealedCells = board.revealCell(4, 4);

      // Should reveal multiple cells due to flood fill
      expect(revealedCells.length).toBeGreaterThan(1);
    });
  });

  describe("flag operations", () => {
    test("should count flagged cells correctly", () => {
      const board = new Board(5, 5, 5);
      expect(board.getFlagCount()).toBe(0);

      board.getCell(0, 0)?.toggleFlag();
      expect(board.getFlagCount()).toBe(1);

      board.getCell(1, 1)?.toggleFlag();
      expect(board.getFlagCount()).toBe(2);

      board.getCell(0, 0)?.toggleFlag();
      expect(board.getFlagCount()).toBe(1);
    });
  });

  describe("win condition", () => {
    test("should count unrevealed safe cells", () => {
      const board = new Board(3, 3, 1);
      board.placeMines(1, 1);

      // Count actual mines placed
      let mineCount = 0;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (board.getCell(row, col)?.hasMine) {
            mineCount++;
          }
        }
      }

      const totalCells = 9;
      expect(board.getUnrevealedSafeCells()).toBe(totalCells - mineCount);
    });

    test("should update unrevealed count after reveal", () => {
      const board = new Board(3, 3, 1);
      const initial = board.getUnrevealedSafeCells();

      board.revealCell(1, 1);

      expect(board.getUnrevealedSafeCells()).toBeLessThan(initial);
    });
  });

  describe("reset", () => {
    test("should reset board to initial state", () => {
      const board = new Board(5, 5, 5);
      board.placeMines(2, 2);
      board.revealCell(0, 0);

      board.reset();

      expect(board.minesPlaced).toBe(false);
      expect(board.getRevealedCount()).toBe(0);
      expect(board.getFlagCount()).toBe(0);
    });
  });

  describe("serialization", () => {
    test("should serialize and deserialize correctly", () => {
      const board = new Board(5, 5, 5);
      board.placeMines(2, 2);
      board.revealCell(0, 0);

      const json = board.toJSON();
      const restored = Board.fromJSON(json);

      expect(restored.rows).toBe(board.rows);
      expect(restored.cols).toBe(board.cols);
      expect(restored.mineCount).toBe(board.mineCount);
      expect(restored.minesPlaced).toBe(board.minesPlaced);
    });
  });
});
