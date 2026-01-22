"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Player,
  SkinStyles,
  DEFAULT_SKIN_STYLES,
  ThemeItemType,
} from "@/lib/classes";

interface PageLayoutProps {
  children: React.ReactNode;
  player?: Player | null;
}

export function PageLayout({ children, player }: PageLayoutProps) {
  const pathname = usePathname();

  // Get skin styles from player's theme shop
  const skinStyles: SkinStyles =
    player?.themeShop.getActiveSkinStyles() ?? DEFAULT_SKIN_STYLES;
  const activeColor = player?.themeShop.getActiveItem(ThemeItemType.COLOR);
  const themeColor = activeColor?.cssValue ?? "#3B82F6";

  const tabs = [
    { href: "/", label: "Game", icon: "🎮" },
    { href: "/stats", label: "Stats", icon: "📊" },
    { href: "/achievements", label: "Achievements", icon: "🏅" },
    { href: "/shop", label: "Shop", icon: "🛒" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div
      className="min-h-screen py-8 px-4 transition-colors duration-300"
      style={{
        backgroundColor: skinStyles.pageBg,
        color: skinStyles.textColor,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6">
          <Link href="/">
            <h1
              className="text-4xl font-bold mb-2 hover:opacity-80 transition-opacity"
              style={{ color: themeColor }}
            >
              💣 Minesweeper
            </h1>
          </Link>
          <p style={{ opacity: 0.7 }}>
            Classic puzzle game with power-ups and achievements!
          </p>
        </header>

        {/* Tab Navigation */}
        <nav className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-6">
          {tabs.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`
                px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-200
                ${isActive(href) ? "text-white shadow-lg" : "hover:opacity-80"}
              `}
              style={
                isActive(href)
                  ? { backgroundColor: themeColor }
                  : {
                      backgroundColor: skinStyles.cellBg,
                      color: skinStyles.textColor,
                    }
              }
            >
              <span className="sm:hidden">{icon}</span>
              <span className="hidden sm:inline">
                {icon} {label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Main Content */}
        <main className="flex flex-col items-center">{children}</main>

        {/* Footer */}
        <footer className="text-center mt-8 text-sm" style={{ opacity: 0.6 }}>
          <p>Built with Next.js, React, and TailwindCSS</p>
          {player && (
            <p className="mt-1">
              Points:{" "}
              <span className="font-bold text-yellow-600">{player.points}</span>
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}
