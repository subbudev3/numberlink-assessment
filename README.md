docker-compose up
# Numberlink — take-home project

This is a small Numberlink-style puzzle implemented with React Native (Expo) and TypeScript.

## Quick start

From the `examples` folder:

```bash
npm install
npm run web    # open in browser
# or
npm start      # run with Expo
```

If you want the mock API for scores, start it from the repo root:

```bash
cd mock-api
docker-compose up
```

The app will try to POST scores to `http://localhost:3000/scores` if that service is running.

## What’s in the repo

- `src/game` — types, solver, and a tiny generator
- `src/data` — sample levels
- `src/components` — `Board`, `Cell`, `Controls`
- `src/screens` — `GameScreen` (main UI)
- `App.tsx` — app entry

## How it’s organized

The UI is separate from the solver. `solveLevel(level)` lives under `src/game` and does not depend on React. `GameScreen` holds UI state (grid, timer, drawing) and asks the solver for validation and hints.

## Solver

The solver is a simple backtracking approach: it finds a path for each pair in order and checks if the grid can be fully filled. It’s small and easy to read; it’s not a tuned solver for hard puzzle generation, but it works for the 5x5 tests here.

## What I implemented

- Dynamic 5x5 board (uses a small procedural generator at start)
- Tap/drag to draw paths
- Reset and Hint buttons
- A "You Win" overlay and a timer
- Independent solver used for validation and hints
- Best-effort POST to `/scores` (no scoreboard UI)

## Tradeoffs and what’s not done

- Solver: straightforward backtracking, not optimized for worst-case puzzles
- Hint: shows a single next cell from the solver’s solution
- No scoreboard UI or persistence; score submission is best-effort
-- No automated test suite

## Notes on development

The core logic is handwritten and should be explainable in an interview.