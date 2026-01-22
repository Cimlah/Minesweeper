"use client";

import { Timer } from "@/lib/classes";

interface TimerDisplayProps {
  seconds: number;
  remainingTime?: number | null;
  isFrozen?: boolean;
}

export function TimerDisplay({
  seconds,
  remainingTime,
  isFrozen,
}: TimerDisplayProps) {
  const formatTime = (secs: number): string => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 bg-gray-800 text-white font-mono text-xl rounded-lg ${isFrozen ? "animate-pulse bg-blue-600" : ""}`}
    >
      <span>⏱️</span>
      {remainingTime !== null && remainingTime !== undefined ? (
        <span className={remainingTime <= 10 ? "text-red-400" : ""}>
          {formatTime(remainingTime)}
        </span>
      ) : (
        <span>{formatTime(seconds)}</span>
      )}
      {isFrozen && <span className="text-sm">❄️</span>}
    </div>
  );
}
