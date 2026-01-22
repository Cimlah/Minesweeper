"use client";

interface PowerUpButtonProps {
  icon: string;
  name: string;
  usesRemaining: number;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function PowerUpButton({
  icon,
  name,
  usesRemaining,
  isActive,
  onClick,
  disabled,
}: PowerUpButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || usesRemaining === 0}
      className={`
        flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200
        ${
          isActive
            ? "bg-yellow-400 text-gray-900 shadow-lg ring-2 ring-yellow-500"
            : usesRemaining > 0
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-gray-400 text-gray-600 cursor-not-allowed"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium">{name}</span>
      <span className="text-xs bg-gray-900/30 px-2 rounded-full">
        ×{usesRemaining}
      </span>
    </button>
  );
}

interface PowerUpsPanelProps {
  timeFreezesRemaining: number;
  shieldsRemaining: number;
  shieldActive: boolean;
  timeFrozen: boolean;
  onTimeFreeze: () => void;
  onShield: () => void;
  disabled?: boolean;
}

export function PowerUpsPanel({
  timeFreezesRemaining,
  shieldsRemaining,
  shieldActive,
  timeFrozen,
  onTimeFreeze,
  onShield,
  disabled,
}: PowerUpsPanelProps) {
  return (
    <div className="flex gap-2">
      <PowerUpButton
        icon="❄️"
        name="Time Freeze"
        usesRemaining={timeFreezesRemaining}
        isActive={timeFrozen}
        onClick={onTimeFreeze}
        disabled={disabled}
      />
      <PowerUpButton
        icon="🛡️"
        name="Shield"
        usesRemaining={shieldsRemaining}
        isActive={shieldActive}
        onClick={onShield}
        disabled={disabled}
      />
    </div>
  );
}
