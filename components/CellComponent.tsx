"use client";

import {
  Cell as CellClass,
  SkinStyles,
  DEFAULT_SKIN_STYLES,
} from "@/lib/classes";

interface CellProps {
  cell: CellClass;
  onClick: () => void;
  onRightClick: () => void;
  onChord: () => void;
  themeColor?: string;
  mineIcon?: string;
  isGameOver?: boolean;
  skinStyles?: SkinStyles;
  cellSize?: number; // Fixed cell size in pixels
}

export function CellComponent({
  cell,
  onClick,
  onRightClick,
  onChord,
  themeColor = "#3b82f6",
  mineIcon = "💣",
  isGameOver = false,
  skinStyles = DEFAULT_SKIN_STYLES,
  cellSize = 32,
}: CellProps) {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onRightClick();
  };

  const handleClick = () => {
    // If the cell is revealed and has adjacent mines, chord it
    if (cell.isRevealed && cell.adjacentMines > 0) {
      onChord();
    } else {
      onClick();
    }
  };

  const handleMiddleClick = (e: React.MouseEvent) => {
    // Middle click (button 1) triggers chording
    if (e.button === 1) {
      e.preventDefault();
      onChord();
    }
  };

  const getContent = (): string => {
    if (cell.isFlagged) {
      return "🚩";
    }
    if (!cell.isRevealed) {
      return "";
    }
    if (cell.hasMine) {
      return mineIcon;
    }
    if (cell.adjacentMines > 0) {
      return cell.adjacentMines.toString();
    }
    return "";
  };

  const getNumberColor = (num: number): string => {
    const colors: Record<number, string> = {
      1: "text-blue-600",
      2: "text-green-600",
      3: "text-red-600",
      4: "text-purple-600",
      5: "text-amber-700",
      6: "text-cyan-600",
      7: "text-gray-800",
      8: "text-gray-600",
    };
    return colors[num] || "";
  };

  const getCellStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      width: cellSize,
      height: cellSize,
      minWidth: cellSize,
      minHeight: cellSize,
      fontSize: cellSize > 24 ? cellSize * 0.5 : 12,
    };

    if (!cell.isRevealed) {
      return {
        ...baseStyle,
        backgroundColor: skinStyles.cellBg,
        borderColor: themeColor,
      };
    }

    if (cell.hasMine) {
      return {
        ...baseStyle,
        backgroundColor: skinStyles.cellMine,
        borderColor: skinStyles.cellMine,
      };
    }

    return {
      ...baseStyle,
      backgroundColor: skinStyles.cellRevealed,
      borderColor: skinStyles.cellRevealed,
    };
  };

  return (
    <button
      className={`flex items-center justify-center font-bold border select-none transition-all duration-100 ${
        !cell.isRevealed
          ? "cursor-pointer shadow-[inset_2px_2px_0_rgba(255,255,255,0.3),inset_-2px_-2px_0_rgba(0,0,0,0.2)] hover:brightness-110"
          : ""
      } ${cell.isRevealed && !cell.hasMine ? getNumberColor(cell.adjacentMines) : ""}`}
      style={getCellStyle()}
      onClick={handleClick}
      onMouseDown={handleMiddleClick}
      onContextMenu={handleContextMenu}
      disabled={isGameOver && !cell.isRevealed}
    >
      {getContent()}
    </button>
  );
}
