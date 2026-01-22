"use client";

import { useState, useEffect } from "react";
import { Player } from "@/lib/classes";
import { StatisticsPanel, PageLayout } from "@/components";

export default function StatsPage() {
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
          <div className="animate-pulse">Loading statistics...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout player={player}>
      <StatisticsPanel statistics={player.statistics} points={player.points} />
    </PageLayout>
  );
}
