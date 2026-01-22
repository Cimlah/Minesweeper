"use client";

import { Board, SkinStyles, DEFAULT_SKIN_STYLES } from "@/lib/classes";
import { CellComponent } from "./CellComponent";

interface BoardComponentProps {
  board: Board;
  onCellClick: (row: number, col: number) => void;
  onCellRightClick: (row: number, col: number) => void;
  onCellChord: (row: number, col: number) => void;
  themeColor?: string;
  mineIcon?: string;
  isGameOver?: boolean;
  skinStyles?: SkinStyles;
}

export function BoardComponent({
  board,
  onCellClick,
  onCellRightClick,
  onCellChord,
  themeColor,
  mineIcon,
  isGameOver,
  skinStyles = DEFAULT_SKIN_STYLES,
}: BoardComponentProps) {
  // Calculate cell size based on board dimensions for consistent sizing
  const calculateCellSize = (): number => {
    const maxCells = Math.max(board.rows, board.cols);
    if (maxCells <= 9) return 40; // Easy: larger cells
    if (maxCells <= 16) return 32; // Medium: medium cells
    if (maxCells <= 24) return 26; // Hard: smaller cells
    if (maxCells <= 30) return 22; // Very large: even smaller
    return 18; // Huge boards: minimum size
  };

  const cellSize = calculateCellSize();

  return (
    <div
      className="inline-block p-2 border-4 rounded-lg shadow-lg"
      style={{
        borderColor: themeColor,
        backgroundColor: skinStyles.boardBg,
      }}
    >
      <div
        className="grid gap-0"
        style={{
          gridTemplateColumns: `repeat(${board.cols}, ${cellSize}px)`,
        }}
      >
        {board.cells.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <CellComponent
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              onClick={() => onCellClick(rowIndex, colIndex)}
              onRightClick={() => onCellRightClick(rowIndex, colIndex)}
              onChord={() => onCellChord(rowIndex, colIndex)}
              themeColor={themeColor}
              mineIcon={mineIcon}
              isGameOver={isGameOver}
              skinStyles={skinStyles}
              cellSize={cellSize}
            />
          )),
        )}
      </div>
    </div>
  );
}
