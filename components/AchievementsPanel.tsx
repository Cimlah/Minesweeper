"use client";

import { Achievement, AchievementManager } from "@/lib/classes";

interface AchievementsPanelProps {
  achievementManager: AchievementManager;
}

export function AchievementsPanel({
  achievementManager,
}: AchievementsPanelProps) {
  const achievements = achievementManager.achievements;
  const progress = achievementManager.progress;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          🏅 Achievements
        </h2>
        <span className="text-sm text-gray-500">
          {achievementManager.unlockedAchievements.length}/{achievements.length}{" "}
          ({progress}%)
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-linear-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-2 max-h-75 overflow-y-auto">
        {achievements.map((achievement) => (
          <AchievementItem key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}

interface AchievementItemProps {
  achievement: Achievement;
}

function AchievementItem({ achievement }: AchievementItemProps) {
  return (
    <div
      className={`
      flex items-center gap-3 p-3 rounded-lg transition-all duration-200
      ${
        achievement.isUnlocked
          ? "bg-yellow-50 border-2 border-yellow-300"
          : "bg-gray-50 opacity-60"
      }
    `}
    >
      <span className="text-2xl">
        {achievement.isUnlocked ? achievement.icon : "🔒"}
      </span>
      <div className="flex-1">
        <div
          className={`font-medium ${achievement.isUnlocked ? "text-gray-800" : "text-gray-500"}`}
        >
          {achievement.name}
        </div>
        <div className="text-sm text-gray-500">{achievement.description}</div>
      </div>
      {achievement.isUnlocked && (
        <span className="text-green-500 text-xl">✓</span>
      )}
    </div>
  );
}

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementNotification({
  achievement,
  onClose,
}: AchievementNotificationProps) {
  return (
    <div className="fixed top-4 right-4 bg-linear-to-r from-yellow-400 to-yellow-600 text-white p-4 rounded-xl shadow-2xl animate-bounce-in z-50 max-w-sm">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white/80 hover:text-white"
      >
        ✕
      </button>
      <div className="flex items-center gap-3">
        <span className="text-4xl">{achievement.icon}</span>
        <div>
          <div className="text-xs uppercase tracking-wider opacity-80">
            Achievement Unlocked!
          </div>
          <div className="font-bold text-lg">{achievement.name}</div>
          <div className="text-sm opacity-90">{achievement.description}</div>
        </div>
      </div>
    </div>
  );
}
