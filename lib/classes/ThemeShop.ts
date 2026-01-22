/**
 * Class 12: ThemeShop
 * Manages themes, colors, skins, and icons that players can purchase.
 */
export interface ThemeItem {
  id: string;
  name: string;
  description: string;
  type: ThemeItemType;
  cost: number;
  preview: string;
  cssValue?: string;
}

export interface SkinStyles {
  cellBg: string;
  cellBgHover: string;
  cellRevealed: string;
  cellMine: string;
  boardBg: string;
  pageBg: string;
  textColor: string;
}

export const DEFAULT_SKIN_STYLES: SkinStyles = {
  cellBg: "#c4c4c4",
  cellBgHover: "#d4d4d4",
  cellRevealed: "#e8e8e8",
  cellMine: "#ef4444",
  boardBg: "#808080",
  pageBg: "#f0f0f0",
  textColor: "#1a1a1a",
};

export enum ThemeItemType {
  COLOR = "color",
  SKIN = "skin",
  ICON = "icon",
}

export class ThemeShop {
  private _availableItems: Map<string, ThemeItem>;
  private _ownedItems: Set<string>;
  private _activeItems: Map<ThemeItemType, string>;

  constructor() {
    this._availableItems = new Map();
    this._ownedItems = new Set();
    this._activeItems = new Map();
    this.initializeItems();
    this.setDefaultActiveItems();
  }

  // Getters
  get availableItems(): ThemeItem[] {
    return Array.from(this._availableItems.values());
  }

  get ownedItems(): ThemeItem[] {
    return this.availableItems.filter((item) => this._ownedItems.has(item.id));
  }

  get unownedItems(): ThemeItem[] {
    return this.availableItems.filter((item) => !this._ownedItems.has(item.id));
  }

  /**
   * Initializes available items in the shop.
   */
  private initializeItems(): void {
    const items: ThemeItem[] = [
      // Colors
      {
        id: "color_default",
        name: "Classic Blue",
        description: "The default blue theme",
        type: ThemeItemType.COLOR,
        cost: 0,
        preview: "🔵",
        cssValue: "#3b82f6",
      },
      {
        id: "color_red",
        name: "Ruby Red",
        description: "A vibrant red theme",
        type: ThemeItemType.COLOR,
        cost: 100,
        preview: "🔴",
        cssValue: "#ef4444",
      },
      {
        id: "color_green",
        name: "Emerald Green",
        description: "A fresh green theme",
        type: ThemeItemType.COLOR,
        cost: 100,
        preview: "🟢",
        cssValue: "#22c55e",
      },
      {
        id: "color_purple",
        name: "Royal Purple",
        description: "A majestic purple theme",
        type: ThemeItemType.COLOR,
        cost: 150,
        preview: "🟣",
        cssValue: "#a855f7",
      },
      {
        id: "color_gold",
        name: "Golden Glory",
        description: "A luxurious gold theme",
        type: ThemeItemType.COLOR,
        cost: 250,
        preview: "🟡",
        cssValue: "#eab308",
      },
      // Skins
      {
        id: "skin_default",
        name: "Classic",
        description: "The classic Minesweeper look",
        type: ThemeItemType.SKIN,
        cost: 0,
        preview: "⬜",
        cssValue: JSON.stringify({
          cellBg: "#c4c4c4",
          cellBgHover: "#d4d4d4",
          cellRevealed: "#e8e8e8",
          cellMine: "#ef4444",
          boardBg: "#808080",
          pageBg: "#f0f0f0",
          textColor: "#1a1a1a",
        }),
      },
      {
        id: "skin_dark",
        name: "Dark Mode",
        description: "A sleek dark theme",
        type: ThemeItemType.SKIN,
        cost: 150,
        preview: "⬛",
        cssValue: JSON.stringify({
          cellBg: "#5a5a5a",
          cellBgHover: "#6a6a6a",
          cellRevealed: "#404040",
          cellMine: "#ff6b6b",
          boardBg: "#2a2a2a",
          pageBg: "#1a1a1a",
          textColor: "#f0f0f0",
        }),
      },
      {
        id: "skin_retro",
        name: "Retro",
        description: "Old-school pixel art style",
        type: ThemeItemType.SKIN,
        cost: 200,
        preview: "🕹️",
        cssValue: JSON.stringify({
          cellBg: "#c0c0c0",
          cellBgHover: "#d4d4d4",
          cellRevealed: "#a0a0a0",
          cellMine: "#ff4444",
          boardBg: "#606060",
          pageBg: "linear-gradient(to bottom right, #006666, #000066)",
          textColor: "#ffffff",
        }),
      },
      {
        id: "skin_neon",
        name: "Neon",
        description: "Glowing neon effects",
        type: ThemeItemType.SKIN,
        cost: 300,
        preview: "💡",
        cssValue: JSON.stringify({
          cellBg: "#2d2d5a",
          cellBgHover: "#3d3d7a",
          cellRevealed: "#1a1a3e",
          cellMine: "#ff2e63",
          boardBg: "#12122a",
          pageBg: "linear-gradient(to bottom right, #0a0a1a, #1a1a2e)",
          textColor: "#00fff5",
        }),
      },
      // Icons
      {
        id: "icon_default",
        name: "Classic Mine",
        description: "The classic bomb icon",
        type: ThemeItemType.ICON,
        cost: 0,
        preview: "💣",
      },
      {
        id: "icon_skull",
        name: "Skull",
        description: "A spooky skull icon",
        type: ThemeItemType.ICON,
        cost: 75,
        preview: "💀",
      },
      {
        id: "icon_fire",
        name: "Fire",
        description: "A fiery explosion icon",
        type: ThemeItemType.ICON,
        cost: 100,
        preview: "🔥",
      },
      {
        id: "icon_star",
        name: "Star",
        description: "A shiny star icon",
        type: ThemeItemType.ICON,
        cost: 125,
        preview: "⭐",
      },
      {
        id: "icon_gem",
        name: "Gem",
        description: "A precious gem icon",
        type: ThemeItemType.ICON,
        cost: 200,
        preview: "💎",
      },
    ];

    for (const item of items) {
      this._availableItems.set(item.id, item);
      // Free items are automatically owned
      if (item.cost === 0) {
        this._ownedItems.add(item.id);
      }
    }
  }

  /**
   * Sets default active items.
   */
  private setDefaultActiveItems(): void {
    this._activeItems.set(ThemeItemType.COLOR, "color_default");
    this._activeItems.set(ThemeItemType.SKIN, "skin_default");
    this._activeItems.set(ThemeItemType.ICON, "icon_default");
  }

  /**
   * Gets an item by ID.
   */
  getItem(id: string): ThemeItem | undefined {
    return this._availableItems.get(id);
  }

  /**
   * Checks if an item is owned.
   */
  isOwned(id: string): boolean {
    return this._ownedItems.has(id);
  }

  /**
   * Checks if an item is active.
   */
  isActive(id: string): boolean {
    const item = this._availableItems.get(id);
    if (!item) return false;
    return this._activeItems.get(item.type) === id;
  }

  /**
   * Gets the active item for a type.
   */
  getActiveItem(type: ThemeItemType): ThemeItem | undefined {
    const activeId = this._activeItems.get(type);
    return activeId ? this._availableItems.get(activeId) : undefined;
  }

  /**
   * Gets the active skin styles parsed from JSON.
   */
  getActiveSkinStyles(): SkinStyles {
    const activeSkin = this.getActiveItem(ThemeItemType.SKIN);
    if (activeSkin?.cssValue) {
      try {
        return JSON.parse(activeSkin.cssValue) as SkinStyles;
      } catch {
        return DEFAULT_SKIN_STYLES;
      }
    }
    return DEFAULT_SKIN_STYLES;
  }

  /**
   * Purchases an item.
   * @param id - The item ID to purchase
   * @param playerPoints - The player's current points
   * @returns Object with success status and remaining points or error message
   */
  purchaseItem(
    id: string,
    playerPoints: number,
  ): { success: boolean; cost?: number; error?: string } {
    const item = this._availableItems.get(id);

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    if (this._ownedItems.has(id)) {
      return { success: false, error: "Item already owned" };
    }

    if (playerPoints < item.cost) {
      return { success: false, error: "Insufficient points" };
    }

    this._ownedItems.add(id);
    return { success: true, cost: item.cost };
  }

  /**
   * Equips an owned item.
   */
  equipItem(id: string): boolean {
    const item = this._availableItems.get(id);

    if (!item || !this._ownedItems.has(id)) {
      return false;
    }

    this._activeItems.set(item.type, id);
    return true;
  }

  /**
   * Gets items by type.
   */
  getItemsByType(type: ThemeItemType): ThemeItem[] {
    return this.availableItems.filter((item) => item.type === type);
  }

  /**
   * Resets the shop (keeps default items).
   */
  reset(): void {
    this._ownedItems.clear();
    // Re-add free items
    for (const item of this._availableItems.values()) {
      if (item.cost === 0) {
        this._ownedItems.add(item.id);
      }
    }
    this.setDefaultActiveItems();
  }

  /**
   * Returns a serializable representation.
   */
  toJSON(): ThemeShopData {
    return {
      ownedItems: Array.from(this._ownedItems),
      activeItems: Object.fromEntries(this._activeItems),
    };
  }

  /**
   * Creates a ThemeShop from serialized data.
   */
  static fromJSON(data: ThemeShopData): ThemeShop {
    const shop = new ThemeShop();
    shop._ownedItems = new Set(data.ownedItems);
    shop._activeItems = new Map(Object.entries(data.activeItems)) as Map<
      ThemeItemType,
      string
    >;
    return shop;
  }
}

export interface ThemeShopData {
  ownedItems: string[];
  activeItems: Record<string, string>;
}
