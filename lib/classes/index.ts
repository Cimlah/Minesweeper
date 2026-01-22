// Export all classes from the lib/classes folder

export { Cell, type CellData } from "./Cell";
export {
  Board,
  type BoardData,
  BOARD_PRESETS,
  type BoardPreset,
  type CustomBoardConfig,
} from "./Board";
export { Timer, type TimerData } from "./Timer";
export {
  GameMode,
  GameModeType,
  GAME_MODES,
  TIME_ATTACK_LIMITS,
  type GameModeConfig,
} from "./GameMode";
export { Statistics, type StatisticsData } from "./Statistics";
export {
  Achievement,
  type AchievementConfig,
  type AchievementData,
  type GameAchievementData,
  ACHIEVEMENT_CONFIGS,
} from "./Achievement";
export {
  AchievementManager,
  type AchievementManagerData,
} from "./AchievementManager";
export { Player, type PlayerData } from "./Player";
export {
  PowerUp,
  type PowerUpConfig,
  type PowerUpData,
  type PowerUpCallback,
} from "./PowerUp";
export { TimeFreezePowerUp } from "./TimeFreezePowerUp";
export { ShieldPowerUp } from "./ShieldPowerUp";
export {
  ThemeShop,
  ThemeItemType,
  type ThemeItem,
  type ThemeShopData,
  type SkinStyles,
  DEFAULT_SKIN_STYLES,
} from "./ThemeShop";
export { Game, GameState, type GameData, type GameDisplayData } from "./Game";
