# Minesweeper — Technical Documentation

## Overview

This project is a Next.js (App Router) Minesweeper game with power-ups, achievements, a theme shop, and player statistics. Game rules and logic live in plain TypeScript classes under lib/classes, while the UI layer is a React client app that renders the board and connects user interactions to the game controller.

## Project Structure

- app/ — Next.js routes and pages (App Router)
  - page.tsx — main game screen
  - stats/page.tsx — player statistics view
  - achievements/page.tsx — achievements view
  - shop/page.tsx — theme shop view
  - layout.tsx — app layout and global wrappers
- components/ — reusable UI components (board, cells, panels, selectors, etc.)
- hooks/ — React hooks encapsulating app logic (useGame)
- lib/classes/ — core game model, rules, and persistence
- public/ — static assets
- **tests**/ — Jest unit tests

## Object Model

### Core game domain

- `Cell` — smallest unit on the board. Tracks position, mine presence, reveal state, flag state, and adjacent mine count. Provides `reveal()` and `toggleFlag()` to enforce rules like “don’t reveal flagged cells.”
- `Board` — owns the 2D grid of `Cell` objects and all board-level mechanics:
  - mine placement (with first-click safety)
  - adjacent mine counts
  - flood fill reveal
  - chording (reveal neighbors when flags match)
  - counting flags, revealed cells, and remaining safe cells
- `Game` — orchestrates a complete play session. Holds the current `Board`, `Timer`, `GameMode`, and power-ups. Validates actions and transitions game state.
- `GameMode` — immutable config describing mode type (classic / time attack), time limit, and bonus multiplier.
- `Timer` — tracks elapsed time, supports pause/resume, and provides tick callbacks.

### Player progression

- `Player` — aggregates `Statistics`, `AchievementManager`, and `ThemeShop`. Tracks points and persists to localStorage.
- `Statistics` — total games, wins/losses, total time, fastest clears, and mines cleared.
- `AchievementManager` — stores all `Achievement` objects and manages unlocking.
- `Achievement` — individual achievement with a check function based on stats and last game data.

### Power-ups and customization

- `PowerUp` — abstract base class that handles activation, duration, usage limits, and serialization.
- `TimeFreezePowerUp` — freezes the timer for a fixed duration.
- `ShieldPowerUp` — blocks one mine explosion; deactivates on use.
- `ThemeShop` — catalog + inventory of purchasable colors, skins, and icons. Tracks owned and active items.

### Class relations (high level)

- `Game` → owns `Board`, `Timer`, `GameMode`, `TimeFreezePowerUp`, `ShieldPowerUp`.
- `Board` → owns `Cell[][]`.
- `Game` → references `Player` to record results and points on end-game.
- `Player` → owns `Statistics`, `AchievementManager`, `ThemeShop`.
- `AchievementManager` → owns many `Achievement`.
- `ThemeShop` → owns many `ThemeItem` entries and active selections.

## Mechanics Implementation

### Board creation and mine placement

- The `Board` is created with rows, columns, and a mine count.
- Mines are placed lazily on the first reveal. The first-click cell and all its neighbors are excluded from mine placement to guarantee a safe start.
- After mine placement, adjacent mine counts are computed for every non-mine cell.

### Adjacent bomb counting

- For each cell, the board gathers its neighbors (8-way) and counts how many have `hasMine = true`.
- The count is stored on the cell as `adjacentMines`.

### Reveal flow (normal click)

1. `Game.revealCell()` validates the action (not game over, cell exists, not revealed/flagged).
2. If this is the first action, `Game` transitions to `PLAYING` and starts the `Timer`.
3. If the clicked cell contains a mine:
   - If `ShieldPowerUp` is active, the shield consumes itself and the cell is flagged instead of triggering a loss.
   - Otherwise, the cell is revealed, all mines are revealed, and the game ends as a loss.
4. If the clicked cell is safe, `Board.revealCell()` performs a flood-fill reveal that expands through zero-adjacent-mine cells.
5. After revealing, `Game` checks whether all safe cells are revealed to determine a win.

### Flood fill

- `Board.floodReveal()` reveals a cell, then if it has zero adjacent mines, recursively reveals all neighbors.
- The reveal respects flags: flagged cells are never revealed by flood-fill.

### Chording

- Chording is triggered from the UI when a revealed numbered cell is clicked again (or middle-clicked).
- `Board.chordCell()` only proceeds if the number of adjacent flags matches the cell’s `adjacentMines`.
- It then reveals all unflagged neighbors. If a mine is revealed, chording reports a hit and stops.
- A recursive chording pass follows to allow newly revealed numbered cells to chord if their surrounding flags match.
- `Game.chordCell()` consumes the result and ends the game on mine hit or checks for win after successful reveal.

## React State Management

### `useGame` hook as the state hub

- The hook owns a single `Game` instance created once with `useState(() => Game.createWithPreset())`. The game object is mutable, and most state updates happen by mutating this object.
- Because the `Game` instance itself doesn’t trigger React re-renders, `useGame` maintains a numeric `updateTrigger`. Any board mutation increments this value to force a re-render.
- `Game.setCallbacks()` wires internal events to React state:
  - `onStateChange` → updates `gameState`, triggers achievements and points on win/loss.
  - `onCellUpdate` → increments `updateTrigger` so the board reflects the new cell states.
  - `onTimerUpdate` → updates `elapsedTime` each second.

### Player persistence and hydration

- `Player` is initialized with a placeholder instance on the server to avoid hydration mismatches.
- On the client, `Player.load()` reads from localStorage and replaces state; `isHydrated` prevents rendering player-dependent UI until this completes.

### UI state vs. domain state

- Domain state is in the `Game` instance (board cells, state, timer, power-up status).
- View state is held in page-level React state (selected difficulty, mode, custom board inputs, flag/reveal mode for mobile).
- UI components receive data as props and call hook actions (`revealCell`, `toggleFlag`, `chordCell`, `newGame`, `useTimeFreeze`, `useShield`).

## Data Flow Summary

1. User interacts with a cell in the UI.
2. Component calls `useGame` action (e.g., `revealCell`).
3. `Game` mutates its internal model and invokes callbacks.
4. `useGame` updates React state (`updateTrigger`, `elapsedTime`, `gameState`).
5. React re-renders and the updated `Board` and status values are displayed.

## Key UI Components

- Board rendering: `BoardComponent` maps the `Board.cells` grid to `CellComponent` elements.
- Status and timers: `GameStatus`, `TimerDisplay`, and `MineCounter` render current game state.
- Controls: `DifficultySelector`, `GameModeSelector`, and `PowerUpsPanel` configure or affect the current game.
- Layout: `PageLayout` applies theme colors/skin and provides navigation.

## Notes on Win/Loss Logic

- Win: when `Board.getUnrevealedSafeCells()` returns zero.
- Loss: when a mine is revealed without a shield, or when time expires in time-attack mode.
- End-of-game triggers point calculation and achievement checks via `Player.recordGame()`.
