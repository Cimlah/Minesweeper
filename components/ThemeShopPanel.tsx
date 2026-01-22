"use client";

import { ThemeShop, ThemeItemType, ThemeItem } from "@/lib/classes";

interface ThemeShopPanelProps {
  themeShop: ThemeShop;
  playerPoints: number;
  onPurchase: (itemId: string) => boolean;
  onEquip: (itemId: string) => void;
  activeTab: ThemeItemType;
  onTabChange: (tab: ThemeItemType) => void;
}

export function ThemeShopPanel({
  themeShop,
  playerPoints,
  onPurchase,
  onEquip,
  activeTab,
  onTabChange,
}: ThemeShopPanelProps) {
  const tabs = [
    { type: ThemeItemType.COLOR, label: "Colors", icon: "🎨" },
    { type: ThemeItemType.SKIN, label: "Skins", icon: "🖼️" },
    { type: ThemeItemType.ICON, label: "Icons", icon: "💎" },
  ];

  const items = themeShop.getItemsByType(activeTab);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          🛒 Theme Shop
        </h2>
        <span className="text-sm font-bold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
          💰 {playerPoints}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => onTabChange(type)}
            className={`
              flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all
              ${
                activeTab === type
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 gap-3 max-h-75 overflow-y-auto">
        {items.map((item) => (
          <ShopItem
            key={item.id}
            item={item}
            isOwned={themeShop.isOwned(item.id)}
            isActive={themeShop.isActive(item.id)}
            canAfford={playerPoints >= item.cost}
            onPurchase={() => onPurchase(item.id)}
            onEquip={() => onEquip(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface ShopItemProps {
  item: ThemeItem;
  isOwned: boolean;
  isActive: boolean;
  canAfford: boolean;
  onPurchase: () => void;
  onEquip: () => void;
}

function ShopItem({
  item,
  isOwned,
  isActive,
  canAfford,
  onPurchase,
  onEquip,
}: ShopItemProps) {
  return (
    <div
      className={`
      p-3 rounded-lg border-2 transition-all
      ${
        isActive
          ? "border-blue-500 bg-blue-50"
          : isOwned
            ? "border-green-300 bg-green-50"
            : "border-gray-200 bg-gray-50"
      }
    `}
    >
      <div className="text-3xl text-center mb-2">{item.preview}</div>
      <div className="text-sm font-medium text-gray-800 text-center truncate">
        {item.name}
      </div>
      <div className="text-xs text-gray-500 text-center mb-2 truncate">
        {item.description}
      </div>

      {isActive ? (
        <div className="w-full py-1 px-2 text-xs font-medium text-center text-blue-600 bg-blue-100 rounded">
          Equipped ✓
        </div>
      ) : isOwned ? (
        <button
          onClick={onEquip}
          className="w-full py-1 px-2 text-xs font-medium text-green-700 bg-green-200 hover:bg-green-300 rounded transition-colors"
        >
          Equip
        </button>
      ) : (
        <button
          onClick={onPurchase}
          disabled={!canAfford}
          className={`
            w-full py-1 px-2 text-xs font-medium rounded transition-colors
            ${
              canAfford
                ? "text-white bg-yellow-500 hover:bg-yellow-600"
                : "text-gray-400 bg-gray-200 cursor-not-allowed"
            }
          `}
        >
          💰 {item.cost}
        </button>
      )}
    </div>
  );
}
