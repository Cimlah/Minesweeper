"use client";

import { useState, useEffect, useCallback } from "react";
import { Player, ThemeItemType } from "@/lib/classes";
import { ThemeShopPanel, PageLayout } from "@/components";

export default function ShopPage() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeShopTab, setActiveShopTab] = useState<ThemeItemType>(
    ThemeItemType.COLOR,
  );

  useEffect(() => {
    const loaded = Player.load();
    if (loaded) {
      setPlayer(loaded);
    } else {
      setPlayer(new Player("Player"));
    }
    setIsHydrated(true);
  }, []);

  const handlePurchase = useCallback(
    (itemId: string): boolean => {
      if (!player) return false;

      const result = player.themeShop.purchaseItem(itemId, player.points);
      if (result.success && result.cost) {
        player.spendPoints(result.cost);
        player.save();
        // Force re-render by reloading player
        const updated = Player.load();
        if (updated) setPlayer(updated);
        return true;
      }
      return false;
    },
    [player],
  );

  const handleEquip = useCallback(
    (itemId: string): void => {
      if (!player) return;

      player.themeShop.equipItem(itemId);
      player.save();

      // Force re-render by reloading player to apply new skin
      const updated = Player.load();
      if (updated) setPlayer(updated);
    },
    [player],
  );

  if (!isHydrated || !player) {
    return (
      <PageLayout>
        <div className="text-center py-8">
          <div className="animate-pulse">Loading shop...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout player={player}>
      <ThemeShopPanel
        themeShop={player.themeShop}
        playerPoints={player.points}
        onPurchase={handlePurchase}
        onEquip={handleEquip}
        activeTab={activeShopTab}
        onTabChange={setActiveShopTab}
      />
    </PageLayout>
  );
}
