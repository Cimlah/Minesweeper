"use client";

import { useState } from "react";
import { useGame } from "@/hooks";
import {
  BoardComponent,
  TimerDisplay,
  MineCounter,
  GameStatus,
  DifficultySelector,
  GameModeSelector,
  PowerUpsPanel,
  AchievementNotification,
  PageLayout,
} from "@/components";
import { GameState, BoardPreset, GameModeType } from "@/lib/classes";

export default function Home() {
  const {
    game,
    player,
    elapsedTime,
    gameState,
    recentAchievements,
    pointsEarned,
    isHydrated,
    revealCell,
    toggleFlag,
    chordCell,
    newGame,
    useTimeFreeze,
    useShield,
    clearRecentAchievements,
    themeColor,
    mineIcon,
    skinStyles,
  } = useGame("small");

  const [selectedDifficulty, setSelectedDifficulty] = useState<
    BoardPreset | "custom"
  >("small");
  const [selectedMode, setSelectedMode] = useState<GameModeType>(
    GameModeType.CLASSIC,
  );
  const [isFlagMode, setIsFlagMode] = useState(false);

  // Custom difficulty state
  const [customRows, setCustomRows] = useState(10);
  const [customCols, setCustomCols] = useState(10);
  const [customMines, setCustomMines] = useState(15);

  const handleDifficultyChange = (difficulty: BoardPreset | "custom") => {
    setSelectedDifficulty(difficulty);
    if (difficulty !== "custom") {
      newGame(difficulty, selectedMode);
    }
  };

  const handleModeChange = (mode: GameModeType) => {
    setSelectedMode(mode);
    if (selectedDifficulty !== "custom") {
      newGame(selectedDifficulty, mode);
    } else {
      newGame({ rows: customRows, cols: customCols, mines: customMines }, mode);
    }
  };

  const handleNewGame = () => {
    if (selectedDifficulty !== "custom") {
      newGame(selectedDifficulty, selectedMode);
    } else {
      newGame(
        { rows: customRows, cols: customCols, mines: customMines },
        selectedMode,
      );
    }
  };

  const handleCustomGameStart = () => {
    newGame(
      { rows: customRows, cols: customCols, mines: customMines },
      selectedMode,
    );
  };

  // Validation for custom board
  const getCustomValidation = () => {
    const minSize = 5;
    const maxSize = 50;
    const maxMinePercentage = 0.85;
    const minMines = 1;

    const errors: string[] = [];

    if (customRows < minSize) errors.push(`Rows must be at least ${minSize}`);
    if (customRows > maxSize) errors.push(`Rows cannot exceed ${maxSize}`);
    if (customCols < minSize)
      errors.push(`Columns must be at least ${minSize}`);
    if (customCols > maxSize) errors.push(`Columns cannot exceed ${maxSize}`);

    const totalCells = customRows * customCols;
    const maxMines = Math.floor(totalCells * maxMinePercentage);

    if (customMines < minMines)
      errors.push(`Must have at least ${minMines} mine`);
    if (customMines > maxMines)
      errors.push(`Max ${maxMines} mines for this board (85%)`);

    return { isValid: errors.length === 0, errors, maxMines };
  };

  const validation = getCustomValidation();

  const isPlaying = gameState === GameState.PLAYING;
  const isGameOver =
    gameState === GameState.WON || gameState === GameState.LOST;

  // Handle cell click based on flag mode (for mobile)
  const handleCellClick = (row: number, col: number) => {
    if (isFlagMode) {
      toggleFlag(row, col);
    } else {
      revealCell(row, col);
    }
  };

  return (
    <PageLayout player={isHydrated ? player : undefined}>
      {/* Achievement Notifications */}
      {recentAchievements.map((achievement) => (
        <AchievementNotification
          key={achievement.id}
          achievement={achievement}
          onClose={() => clearRecentAchievements()}
        />
      ))}

      <div className="flex flex-col items-center gap-6">
        {/* Game Settings */}
        <div className="flex flex-col gap-4 w-full max-w-lg">
          <DifficultySelector
            currentDifficulty={selectedDifficulty}
            onSelect={handleDifficultyChange}
            disabled={isPlaying}
          />

          {/* Custom Board Configuration */}
          {selectedDifficulty === "custom" && !isPlaying && (
            <div
              className="p-4 rounded-lg border-2"
              style={{
                backgroundColor: skinStyles.cellRevealed,
                borderColor: themeColor,
              }}
            >
              <h3 className="font-bold mb-3 text-center">Custom Board</h3>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Rows (5-50)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={customRows}
                    onChange={(e) =>
                      setCustomRows(Math.max(1, parseInt(e.target.value) || 5))
                    }
                    className="w-full px-2 py-1 rounded border text-center text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Cols (5-50)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={customCols}
                    onChange={(e) =>
                      setCustomCols(Math.max(1, parseInt(e.target.value) || 5))
                    }
                    className="w-full px-2 py-1 rounded border text-center text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Mines (1-{validation.maxMines})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={validation.maxMines}
                    value={customMines}
                    onChange={(e) =>
                      setCustomMines(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-full px-2 py-1 rounded border text-center text-black"
                  />
                </div>
              </div>
              {!validation.isValid && (
                <div className="text-red-500 text-xs mb-2">
                  {validation.errors.join(". ")}
                </div>
              )}
              <button
                onClick={handleCustomGameStart}
                disabled={!validation.isValid}
                className={`w-full py-2 rounded-lg font-bold transition-all ${
                  validation.isValid
                    ? "text-white hover:opacity-90"
                    : "bg-gray-400 text-gray-600 cursor-not-allowed"
                }`}
                style={
                  validation.isValid ? { backgroundColor: themeColor } : {}
                }
              >
                Start Custom Game ({customRows}×{customCols} • {customMines}{" "}
                mines)
              </button>
            </div>
          )}

          <GameModeSelector
            currentMode={selectedMode}
            onSelect={handleModeChange}
            disabled={isPlaying}
          />
        </div>

        {/* Game Header */}
        <div className="flex items-center justify-between gap-4 w-full max-w-lg">
          <MineCounter count={game.minesRemaining} />
          <GameStatus
            state={gameState}
            onNewGame={handleNewGame}
            pointsEarned={
              gameState === GameState.WON ? pointsEarned : undefined
            }
          />
          <TimerDisplay
            seconds={elapsedTime}
            remainingTime={game.gameMode.getRemainingTime(elapsedTime)}
            isFrozen={game.timeFreeze.isActive}
          />
        </div>

        {/* Power-ups */}
        <PowerUpsPanel
          timeFreezesRemaining={game.timeFreeze.usesRemaining}
          shieldsRemaining={game.shield.usesRemaining}
          shieldActive={game.shield.isActive}
          timeFrozen={game.timeFreeze.isActive}
          onTimeFreeze={useTimeFreeze}
          onShield={useShield}
          disabled={!isPlaying}
        />

        {/* Mobile Controls */}
        <div className="sm:hidden flex items-center justify-center gap-4 w-full max-w-lg">
          <button
            onClick={() => setIsFlagMode(false)}
            disabled={!isPlaying}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-lg transition-all ${
              !isFlagMode
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-700"
            } ${!isPlaying ? "opacity-50" : ""}`}
          >
            👆 Reveal
          </button>
          <button
            onClick={() => setIsFlagMode(true)}
            disabled={!isPlaying}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-lg transition-all ${
              isFlagMode
                ? "bg-red-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-700"
            } ${!isPlaying ? "opacity-50" : ""}`}
          >
            🚩 Flag
          </button>
        </div>

        {/* Game Board */}
        <div className="overflow-x-auto max-w-full">
          <BoardComponent
            board={game.board}
            onCellClick={handleCellClick}
            onCellRightClick={toggleFlag}
            onCellChord={chordCell}
            themeColor={themeColor}
            mineIcon={mineIcon}
            isGameOver={isGameOver}
            skinStyles={skinStyles}
          />
        </div>

        {/* Game Over Message */}
        {isGameOver && (
          <div
            className={`
            text-center p-4 rounded-lg shadow-lg
            ${
              gameState === GameState.WON
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }
          `}
          >
            <p className="text-xl font-bold mb-2">
              {gameState === GameState.WON
                ? "🎉 Congratulations!"
                : "💥 Game Over!"}
            </p>
            <p>
              {gameState === GameState.WON
                ? `You cleared the board in ${elapsedTime} seconds!`
                : "Better luck next time!"}
            </p>
            {gameState === GameState.WON && (
              <p className="text-green-600 font-bold mt-2">
                +{pointsEarned} points!
              </p>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-center text-sm mt-4" style={{ opacity: 0.6 }}>
          <p className="hidden sm:block">
            Left-click to reveal • Right-click to flag
          </p>
          <p className="sm:hidden">
            Tap to {isFlagMode ? "flag" : "reveal"} • Use buttons above to
            switch mode
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
