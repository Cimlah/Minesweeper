"use client";

import { GameModeType, GAME_MODES } from "@/lib/classes";

interface GameModeSelectorProps {
  currentMode: GameModeType;
  onSelect: (mode: GameModeType) => void;
  disabled?: boolean;
}

export function GameModeSelector({
  currentMode,
  onSelect,
  disabled,
}: GameModeSelectorProps) {
  const modes = Object.values(GAME_MODES);

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {modes.map((mode) => (
        <button
          key={mode.type}
          onClick={() => onSelect(mode.type)}
          disabled={disabled}
          className={`
            px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${
              currentMode === mode.type
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <div className="text-sm font-bold">{mode.name}</div>
          <div className="text-xs opacity-75 max-w-30 truncate">
            {mode.description}
          </div>
        </button>
      ))}
    </div>
  );
}
