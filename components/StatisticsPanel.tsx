"use client";

import { Statistics } from "@/lib/classes";

interface StatisticsPanelProps {
  statistics: Statistics;
  points: number;
}

export function StatisticsPanel({ statistics, points }: StatisticsPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        📊 Statistics
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <StatItem
          label="Points"
          value={points.toLocaleString()}
          icon="💰"
          highlight
        />
        <StatItem
          label="Games Played"
          value={statistics.totalGamesPlayed.toString()}
          icon="🎮"
        />
        <StatItem label="Wins" value={statistics.wins.toString()} icon="🏆" />
        <StatItem
          label="Losses"
          value={statistics.losses.toString()}
          icon="💀"
        />
        <StatItem
          label="Win Rate"
          value={`${statistics.successRate}%`}
          icon="📈"
        />
        <StatItem
          label="Mines Cleared"
          value={statistics.totalMinesCleared.toString()}
          icon="💣"
        />
        <StatItem
          label="Time Played"
          value={Statistics.formatPlayTime(statistics.totalTimePlayed)}
          icon="⏱️"
        />
        <StatItem
          label="Best Time"
          value={
            statistics.fastestClearTime
              ? Statistics.formatPlayTime(statistics.fastestClearTime)
              : "N/A"
          }
          icon="🚀"
        />
      </div>
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: string;
  icon: string;
  highlight?: boolean;
}

function StatItem({ label, value, icon, highlight }: StatItemProps) {
  return (
    <div
      className={`
      p-3 rounded-lg
      ${highlight ? "bg-yellow-100 border-2 border-yellow-400" : "bg-gray-50"}
    `}
    >
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div
        className={`text-lg font-bold ${highlight ? "text-yellow-600" : "text-gray-800"}`}
      >
        {value}
      </div>
    </div>
  );
}
