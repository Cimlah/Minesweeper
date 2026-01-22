"use client";

interface MineCounterProps {
  count: number;
}

export function MineCounter({ count }: MineCounterProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white font-mono text-xl rounded-lg">
      <span>💣</span>
      <span className={count < 0 ? "text-red-400" : ""}>
        {count.toString().padStart(3, "0")}
      </span>
    </div>
  );
}
