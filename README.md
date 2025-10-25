# Minesweeper (Next.js)

A simple Minesweeper game implemented as a small Next.js project. The UI will be built with React and backend with NextJS.

## Project overview

This project implements the classic Minesweeper rules: a grid of cells contains hidden mines, the player reveals cells and marks suspected mines. Revealing a mine ends the game; revealing all safe cells wins the game.

## Tech stack (planned)

- Next.js app router
- React (functional components + hooks)
- JavaScript + TypeScript
- TailwindCSS

## Key features

- Core Minesweeper mechanics
  - Board generation with configurable rows/columns and mine count
  - Reveal cell (flood fill for empty neighbors)
  - Flag/Mark cell
  - Game timer and mine counter
  - Win / lose detection and end-game UI
- Preset board sizes (small / medium / large) + custom board
- Responsive UI (desktop + mobile)
- Simple theming (light / dark or color presets)
- Game modes:
  - Classis Minesweeper
  - Time-attack
- Power-ups:
  - Time freeze
  - Shield
- Player statistics:
  - Total time played
  - Total games played
  - Wins
  - Losses
  - Fastest clear time
  - Success rate
- Achievement system
  - First Blood - win your first game.
  - Mine Sweeper Master - clear 100 mines
  - Speed Demon - clear a medium board in under 60 seconds

## Gameplay rules (classic)

1. The board contains a set number of mines randomly placed.
2. Clicking a covered cell reveals it:
   - If it contains a mine -> game over.
   - If it has zero adjacent mines -> reveal adjacent cells recursively.
   - Otherwise, show the number of adjacent mines.
3. Right-click (or long-press) toggles a flag to mark a suspected mine.
4. The game is won when all non-mine cells are revealed.

## Next steps / roadmap

1. Initialize a Next.js app (TypeScript template).
2. Implement core board generation and unit tests.
3. Generate UML diagram based on defined classes
4. Create UI for the board and cells, wire up game state.
5. Add persistence for stats and small UI polish.
