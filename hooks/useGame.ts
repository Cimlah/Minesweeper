"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Game,
  GameState,
  Player,
  BoardPreset,
  GameModeType,
  Achievement,
  ThemeItemType,
  SkinStyles,
  DEFAULT_SKIN_STYLES,
  CustomBoardConfig,
} from "@/lib/classes";

export interface UseGameReturn {
  game: Game;
  player: Player;
  elapsedTime: number;
  gameState: GameState;
  updateTrigger: number;
  recentAchievements: Achievement[];
  pointsEarned: number;
  isHydrated: boolean;

  // Actions
  revealCell: (row: number, col: number) => void;
  toggleFlag: (row: number, col: number) => void;
  chordCell: (row: number, col: number) => void;
  newGame: (
    difficulty?: BoardPreset | CustomBoardConfig,
    mode?: GameModeType,
  ) => void;
  useTimeFreeze: () => void;
  useShield: () => void;
  purchaseItem: (itemId: string) => boolean;
  equipItem: (itemId: string) => void;
  clearRecentAchievements: () => void;

  // Theme
  themeColor: string;
  mineIcon: string;
  skinStyles: SkinStyles;
}

export function useGame(
  initialDifficulty: BoardPreset = "small",
): UseGameReturn {
  const [game] = useState<Game>(() => Game.createWithPreset(initialDifficulty));
  // Always initialize with a new Player to avoid hydration mismatch
  // The actual player data will be loaded from localStorage in useEffect
  const [player, setPlayer] = useState<Player>(() => new Player("Player"));
  const [isHydrated, setIsHydrated] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>(
    [],
  );
  const [pointsEarned, setPointsEarned] = useState(0);

  // Initialize game with player
  useEffect(() => {
    game.setPlayer(player);
    game.setCallbacks({
      onStateChange: (state) => {
        setGameState(state);
        if (state === GameState.WON || state === GameState.LOST) {
          // Check for new achievements
          const newAchievements = player.achievementManager.recentlyUnlocked;
          if (newAchievements.length > 0) {
            setRecentAchievements(newAchievements);
          }

          // Calculate points earned
          if (state === GameState.WON) {
            const points = player.calculateGamePoints(
              true,
              game.timer.getElapsedSeconds(),
              game.difficulty,
              game.gameMode.bonusMultiplier,
            );
            setPointsEarned(points);
          } else {
            setPointsEarned(0);
          }
        }
      },
      onCellUpdate: () => {
        setUpdateTrigger((prev) => prev + 1);
      },
      onTimerUpdate: (seconds) => {
        setElapsedTime(seconds);
      },
    });
  }, [game, player]);

  // Load player on client side after hydration
  useEffect(() => {
    const loaded = Player.load();
    if (loaded) {
      setPlayer(loaded);
    }
    setIsHydrated(true);
  }, []);

  const revealCell = useCallback(
    (row: number, col: number) => {
      game.revealCell(row, col);
      setUpdateTrigger((prev) => prev + 1);
    },
    [game],
  );

  const toggleFlag = useCallback(
    (row: number, col: number) => {
      game.toggleFlag(row, col);
      setUpdateTrigger((prev) => prev + 1);
    },
    [game],
  );

  const chordCell = useCallback(
    (row: number, col: number) => {
      game.chordCell(row, col);
      setUpdateTrigger((prev) => prev + 1);
    },
    [game],
  );

  const newGame = useCallback(
    (difficulty?: BoardPreset | CustomBoardConfig, mode?: GameModeType) => {
      // Check if it's a custom config object or a preset string
      if (difficulty && typeof difficulty === "object") {
        // Custom board config
        game.reset(
          difficulty.rows,
          difficulty.cols,
          difficulty.mines,
          "custom",
        );
      } else {
        // Preset difficulty
        const diff = difficulty ?? (game.difficulty as BoardPreset);
        game.reset(undefined, undefined, undefined, diff);
      }

      if (mode) {
        game.setGameMode(mode);
      }

      setElapsedTime(0);
      setGameState(GameState.IDLE);
      setPointsEarned(0);
      setUpdateTrigger((prev) => prev + 1);
    },
    [game],
  );

  const useTimeFreeze = useCallback(() => {
    game.useTimeFreeze();
    setUpdateTrigger((prev) => prev + 1);
  }, [game]);

  const useShield = useCallback(() => {
    game.useShield();
    setUpdateTrigger((prev) => prev + 1);
  }, [game]);

  const purchaseItem = useCallback(
    (itemId: string): boolean => {
      const result = player.themeShop.purchaseItem(itemId, player.points);
      if (result.success && result.cost) {
        player.spendPoints(result.cost);
        player.save();
        setPlayer(player);
        setUpdateTrigger((prev) => prev + 1);
        return true;
      }
      return false;
    },
    [player],
  );

  const equipItem = useCallback(
    (itemId: string) => {
      player.themeShop.equipItem(itemId);
      player.save();
      setUpdateTrigger((prev) => prev + 1);
    },
    [player],
  );

  const clearRecentAchievements = useCallback(() => {
    player.achievementManager.clearRecentlyUnlocked();
    setRecentAchievements([]);
  }, [player]);

  // Get active theme
  const activeColor = player.themeShop.getActiveItem(ThemeItemType.COLOR);
  const activeIcon = player.themeShop.getActiveItem(ThemeItemType.ICON);
  const skinStyles = player.themeShop.getActiveSkinStyles();

  const themeColor = activeColor?.cssValue ?? "#3b82f6";
  const mineIcon = activeIcon?.preview ?? "💣";

  return {
    game,
    player,
    elapsedTime,
    gameState,
    updateTrigger,
    recentAchievements,
    pointsEarned,
    isHydrated,
    revealCell,
    toggleFlag,
    chordCell,
    newGame,
    useTimeFreeze,
    useShield,
    purchaseItem,
    equipItem,
    clearRecentAchievements,
    themeColor,
    mineIcon,
    skinStyles,
  };
}
