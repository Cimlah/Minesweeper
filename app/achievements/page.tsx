"use client";

import { useState, useEffect } from "react";
import { Player } from "@/lib/classes";
import { AchievementsPanel, PageLayout } from "@/components";

export default function AchievementsPage() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const loaded = Player.load();
    if (loaded) {
      setPlayer(loaded);
    } else {
      setPlayer(new Player("Player"));
    }
    setIsHydrated(true);
  }, []);

  if (!isHydrated || !player) {
    return (
      <PageLayout>
        <div className="text-center py-8">
          <div className="animate-pulse">Loading achievements...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout player={player}>
      <AchievementsPanel achievementManager={player.achievementManager} />
    </PageLayout>
  );
}
