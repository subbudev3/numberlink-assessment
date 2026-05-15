# Numberlink — take-home project

This is a small Numberlink-style puzzle built with React Native, Expo, and TypeScript.

## Quick start

From the project root:

```bash
npm install
npm run web
# or
npm start
```

## Mock API

The app can submit scores to a mock API.

From the repo root:

```bash
cd mock-api
docker-compose up
```

The app posts scores to:

```txt
http://localhost:3000/scores
```

## What’s in the repo

- `src/game` — types, solver, and generator
- `src/data` — level data
- `src/components` — Board, Cell, Controls
- `src/screens` — GameScreen
- `App.tsx` — app entry point

## How it’s organized

The UI and game logic are kept separate. The solver lives in `src/game/solver.ts` and does not depend on React. `GameScreen` handles the game state, timer, drawing, hints, and score submission.

## Solver

The solver uses a simple backtracking approach. It connects each pair recursively and returns a valid completed board when a solution exists.

This works for the 5x5 puzzle size used here, but I would optimize it before supporting larger or harder boards.

## Implemented

- Dynamic 5x5 board
- Tap/drag path drawing
- Reset button
- Hint button
- Timer
- You Win overlay
- Independent solver
- Basic procedural level generation
- Best-effort score POST to `/scores`

## Tradeoffs

- Solver is simple and not optimized for worst-case puzzles
- Hint reveals one next move based on the solver output
- Score submission is best-effort only
- No scoreboard UI
- No full automated test suite
