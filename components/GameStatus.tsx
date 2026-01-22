"use client";

import { GameState } from "@/lib/classes";

interface GameStatusProps {
  state: GameState;
  onNewGame: () => void;
  pointsEarned?: number;
}

export function GameStatus({
  state,
  onNewGame,
  pointsEarned,
}: GameStatusProps) {
  const getEmoji = (): string => {
    switch (state) {
      case GameState.WON:
        return "😎";
      case GameState.LOST:
        return "😵";
      case GameState.PAUSED:
        return "⏸️";
      default:
        return "🙂";
    }
  };

  const getMessage = (): string => {
    switch (state) {
      case GameState.WON:
        return "You Win!";
      case GameState.LOST:
        return "Game Over!";
      case GameState.PAUSED:
        return "Paused";
      case GameState.PLAYING:
        return "Playing...";
      default:
        return "Click to Start";
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onNewGame}
        className="w-16 h-16 text-4xl bg-yellow-400 hover:bg-yellow-300 rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
      >
        {getEmoji()}
      </button>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600">{getMessage()}</p>
        {state === GameState.WON && pointsEarned !== undefined && (
          <p className="text-xs text-green-600 font-bold">
            +{pointsEarned} points!
          </p>
        )}
      </div>
    </div>
  );
}
