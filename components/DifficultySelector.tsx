"use client";

import { BoardPreset } from "@/lib/classes";

interface DifficultySelectorProps {
  currentDifficulty: BoardPreset | "custom";
  onSelect: (difficulty: BoardPreset | "custom") => void;
  disabled?: boolean;
}

export function DifficultySelector({
  currentDifficulty,
  onSelect,
  disabled,
}: DifficultySelectorProps) {
  const difficulties: {
    key: BoardPreset | "custom";
    label: string;
    description: string;
  }[] = [
    { key: "small", label: "Easy", description: "9×9 • 10 mines" },
    { key: "medium", label: "Medium", description: "16×16 • 40 mines" },
    { key: "large", label: "Hard", description: "16×30 • 99 mines" },
    { key: "custom", label: "Custom", description: "Your rules" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {difficulties.map(({ key, label, description }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          disabled={disabled}
          className={`
            px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${
              currentDifficulty === key
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <div className="text-sm font-bold">{label}</div>
          <div className="text-xs opacity-75">{description}</div>
        </button>
      ))}
    </div>
  );
}
