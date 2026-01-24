import { Timer } from "../lib/classes/Timer";
import {
  GameMode,
  GameModeType,
  GAME_MODES,
  TIME_ATTACK_LIMITS,
} from "../lib/classes/GameMode";
import { Statistics } from "../lib/classes/Statistics";
import { Achievement, ACHIEVEMENT_CONFIGS } from "../lib/classes/Achievement";
import { AchievementManager } from "../lib/classes/AchievementManager";
import { Player } from "../lib/classes/Player";
import {
  ThemeShop,
  ThemeItemType,
  DEFAULT_SKIN_STYLES,
} from "../lib/classes/ThemeShop";
import { ShieldPowerUp } from "../lib/classes/ShieldPowerUp";
import { TimeFreezePowerUp } from "../lib/classes/TimeFreezePowerUp";
import { Game } from "../lib/classes/Game";

describe("Timer", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2020-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("starts, pauses, resumes, and stops correctly", () => {
    const timer = new Timer();

    timer.start();
    jest.advanceTimersByTime(2500);
    expect(timer.isRunning).toBe(true);
    expect(timer.getElapsedSeconds()).toBe(2);

    timer.pause();
    expect(timer.isPaused).toBe(true);
    jest.advanceTimersByTime(5000);
    expect(timer.getElapsedSeconds()).toBe(2);

    timer.resume();
    expect(timer.isPaused).toBe(false);
    jest.advanceTimersByTime(2000);
    expect(timer.getElapsedSeconds()).toBe(4);

    timer.stop();
    expect(timer.isRunning).toBe(false);
    const stoppedTime = timer.getElapsedSeconds();
    jest.advanceTimersByTime(3000);
    expect(timer.getElapsedSeconds()).toBe(stoppedTime);
  });

  test("freezes and resumes after duration", () => {
    const timer = new Timer();
    timer.start();
    jest.advanceTimersByTime(3000);

    timer.freeze(10000);
    expect(timer.isFrozen).toBe(true);
    expect(timer.isPaused).toBe(true);

    jest.advanceTimersByTime(5000);
    expect(timer.isFrozen).toBe(true);
    expect(timer.getElapsedSeconds()).toBe(3);

    jest.advanceTimersByTime(5000);
    expect(timer.isFrozen).toBe(false);
    expect(timer.isPaused).toBe(false);

    jest.advanceTimersByTime(2000);
    expect(timer.getElapsedSeconds()).toBe(5);
  });

  test("formats time as MM:SS", () => {
    expect(Timer.formatTime(0)).toBe("00:00");
    expect(Timer.formatTime(5)).toBe("00:05");
    expect(Timer.formatTime(65)).toBe("01:05");
  });
});

describe("GameMode", () => {
  test("reports time limit behavior", () => {
    const classic = GAME_MODES[GameModeType.CLASSIC];
    const timeAttack = GAME_MODES[GameModeType.TIME_ATTACK];

    expect(classic.hasTimeLimit()).toBe(false);
    expect(timeAttack.hasTimeLimit()).toBe(true);
    expect(timeAttack.isTimeExpired(timeAttack.timeLimit ?? 0)).toBe(true);
    expect(timeAttack.isTimeExpired((timeAttack.timeLimit ?? 0) - 1)).toBe(
      false,
    );
    expect(timeAttack.getRemainingTime(0)).toBe(timeAttack.timeLimit);
    expect(timeAttack.getRemainingTime(timeAttack.timeLimit ?? 0)).toBe(0);
    expect(classic.getRemainingTime(10)).toBeNull();
  });

  test("calculates bonuses with multiplier", () => {
    const mode = new GameMode({
      type: GameModeType.TIME_ATTACK,
      name: "Test",
      description: "Test mode",
      timeLimit: 10,
      bonusMultiplier: 2.5,
    });

    expect(mode.calculateBonus(100)).toBe(250);
  });
});

describe("Statistics", () => {
  test("records wins and updates fastest times", () => {
    const stats = new Statistics();
    stats.recordWin(50, 10, "small");

    expect(stats.totalGamesPlayed).toBe(1);
    expect(stats.wins).toBe(1);
    expect(stats.totalTimePlayed).toBe(50);
    expect(stats.totalMinesCleared).toBe(10);
    expect(stats.fastestClearTime).toBe(50);
    expect(stats.getFastestTimeByDifficulty("small")).toBe(50);

    stats.recordWin(40, 5, "small");
    expect(stats.fastestClearTime).toBe(40);
    expect(stats.getFastestTimeByDifficulty("small")).toBe(40);
  });

  test("records losses and calculates success rate", () => {
    const stats = new Statistics();
    stats.recordLoss(20);
    stats.recordWin(10, 1, "small");

    expect(stats.totalGamesPlayed).toBe(2);
    expect(stats.losses).toBe(1);
    expect(stats.wins).toBe(1);
    expect(stats.successRate).toBe(50);
  });

  test("formats play time", () => {
    expect(Statistics.formatPlayTime(59)).toBe("59s");
    expect(Statistics.formatPlayTime(61)).toBe("1m 1s");
    expect(Statistics.formatPlayTime(3661)).toBe("1h 1m 1s");
  });
});

describe("Achievement", () => {
  test("unlocks and serializes correctly", () => {
    const config = ACHIEVEMENT_CONFIGS[0];
    const achievement = new Achievement(config);

    expect(achievement.isUnlocked).toBe(false);
    achievement.unlock();
    expect(achievement.isUnlocked).toBe(true);
    expect(achievement.unlockedAt).not.toBeNull();

    const data = achievement.toJSON();
    const restored = new Achievement(config);
    restored.fromData(data);
    expect(restored.isUnlocked).toBe(true);
    expect(restored.unlockedAt).not.toBeNull();
  });
});

describe("AchievementManager", () => {
  test("unlocks achievements and reports progress", () => {
    const manager = new AchievementManager();
    const stats = new Statistics();

    expect(manager.progress).toBe(0);

    stats.recordWin(10, 1, "small");
    const unlocked = manager.checkAchievements(stats, {
      won: true,
      timeTaken: 10,
      difficulty: "small",
      minesCleared: 1,
    });

    expect(unlocked.length).toBeGreaterThan(0);
    expect(manager.unlockedAchievements.length).toBeGreaterThan(0);
    expect(manager.progress).toBeGreaterThan(0);

    manager.clearRecentlyUnlocked();
    expect(manager.recentlyUnlocked.length).toBe(0);
  });

  test("adds custom achievements without duplication", () => {
    const manager = new AchievementManager();
    const before = manager.achievements.length;

    manager.addAchievement({
      id: "custom",
      name: "Custom",
      description: "Custom",
      icon: "✨",
      checkCondition: () => true,
    });

    expect(manager.achievements.length).toBe(before + 1);

    manager.addAchievement({
      id: "custom",
      name: "Custom",
      description: "Custom",
      icon: "✨",
      checkCondition: () => true,
    });

    expect(manager.achievements.length).toBe(before + 1);
  });

  test("serializes and restores achievement state", () => {
    const manager = new AchievementManager();
    const stats = new Statistics();

    stats.recordWin(10, 1, "small");
    manager.checkAchievements(stats, {
      won: true,
      timeTaken: 10,
      difficulty: "small",
      minesCleared: 1,
    });

    const data = manager.toJSON();
    const restored = AchievementManager.fromJSON(data);
    expect(restored.unlockedAchievements.length).toBe(
      manager.unlockedAchievements.length,
    );
  });
});

describe("Player", () => {
  test("calculates points and records wins", () => {
    const player = new Player("Tester");

    const points = player.recordGame(true, 50, 10, "medium", 2);
    expect(points).toBeGreaterThan(0);
    expect(player.points).toBe(points);
    expect(player.statistics.wins).toBe(1);
  });

  test("records losses without points", () => {
    const player = new Player("Tester");
    const points = player.recordGame(false, 20, 0, "small");
    expect(points).toBe(0);
    expect(player.points).toBe(0);
    expect(player.statistics.losses).toBe(1);
  });

  test("spends points only when sufficient", () => {
    const player = new Player("Tester");
    player.addPoints(50);

    expect(player.spendPoints(60)).toBe(false);
    expect(player.spendPoints(50)).toBe(true);
    expect(player.points).toBe(0);
  });
});

describe("ThemeShop", () => {
  test("owns free items and equips owned items", () => {
    const shop = new ThemeShop();

    expect(shop.isOwned("color_default")).toBe(true);
    expect(shop.isActive("color_default")).toBe(true);

    const purchase = shop.purchaseItem("color_red", 200);
    expect(purchase.success).toBe(true);
    expect(shop.isOwned("color_red")).toBe(true);
    expect(shop.equipItem("color_red")).toBe(true);
    expect(shop.isActive("color_red")).toBe(true);
  });

  test("handles purchase errors", () => {
    const shop = new ThemeShop();

    expect(shop.purchaseItem("missing", 100)).toEqual({
      success: false,
      error: "Item not found",
    });

    expect(shop.purchaseItem("color_default", 100)).toEqual({
      success: false,
      error: "Item already owned",
    });

    expect(shop.purchaseItem("color_gold", 100)).toEqual({
      success: false,
      error: "Insufficient points",
    });
  });

  test("returns active skin styles", () => {
    const shop = new ThemeShop();
    const styles = shop.getActiveSkinStyles();
    expect(styles).toEqual(DEFAULT_SKIN_STYLES);
    expect(shop.getActiveItem(ThemeItemType.SKIN)?.id).toBe("skin_default");
  });
});

describe("PowerUps", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("ShieldPowerUp activates and breaks", () => {
    const shield = new ShieldPowerUp();
    let activated = 0;
    let broken = 0;

    shield.setOnShieldActivate(() => {
      activated += 1;
    });
    shield.setOnShieldBreak(() => {
      broken += 1;
    });

    expect(shield.activate()).toBe(true);
    expect(shield.isActive).toBe(true);
    expect(shield.usesRemaining).toBe(shield.maxUses - 1);
    expect(activated).toBe(1);

    expect(shield.useShield()).toBe(true);
    expect(shield.isActive).toBe(false);
    expect(shield.shieldBroken).toBe(true);
    expect(broken).toBe(1);
  });

  test("TimeFreezePowerUp activates and auto-deactivates", () => {
    const freeze = new TimeFreezePowerUp();
    let froze = 0;
    let unfroze = 0;

    freeze.setOnFreeze(() => {
      froze += 1;
    });
    freeze.setOnUnfreeze(() => {
      unfroze += 1;
    });

    expect(freeze.activate()).toBe(true);
    expect(freeze.isActive).toBe(true);
    expect(freeze.usesRemaining).toBe(freeze.maxUses - 1);
    expect(froze).toBe(1);

    jest.advanceTimersByTime(freeze.duration);
    expect(freeze.isActive).toBe(false);
    expect(unfroze).toBe(1);
  });
});

describe("Game", () => {
  test("initializes with idle state and classic mode", () => {
    const game = new Game();
    expect(game.state).toBe("idle");
    expect(game.gameMode.type).toBe(GameModeType.CLASSIC);
    expect(game.minesRemaining).toBe(game.board.mineCount);
  });

  test("updates time attack limit based on difficulty", () => {
    const game = new Game(5, 5, 5, "small");
    game.setGameMode(GameModeType.TIME_ATTACK);
    expect(game.gameMode.timeLimit).toBe(TIME_ATTACK_LIMITS.small);
  });

  test("keeps default time limit for custom difficulty", () => {
    const game = new Game(5, 5, 5, "custom");
    game.setGameMode(GameModeType.TIME_ATTACK);
    expect(game.gameMode.timeLimit).toBe(
      GAME_MODES[GameModeType.TIME_ATTACK].timeLimit,
    );
  });

  test("reset returns game to idle state", () => {
    const game = new Game();
    game.reset(6, 6, 5, "custom");
    expect(game.state).toBe("idle");
    expect(game.board.rows).toBe(6);
    expect(game.board.cols).toBe(6);
    expect(game.board.mineCount).toBe(5);
  });
});
