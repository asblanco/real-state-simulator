# Real State Simulator

Frontend-only real estate investment simulator. Static HTML + TypeScript, bundled with Bun.

## Commands

- `bun install` — install dependencies
- `bun run build` — bundle TypeScript to `dist/index.js`
- `bun test` — run tests
- `bun run dev` — build in watch mode

## Tech

- **Runtime:** Bun (not Node.js)
- **Bundler:** Bun's built-in bundler (not webpack/vite/esbuild)
- **Testing:** `bun:test` (not jest/vitest)
- **Charts:** Chart.js
- **Styling:** Tailwind CSS (CDN via `@tailwindcss/browser`)

## Project Structure

- `src/index.ts` — entry point
- `src/calculator.ts` — financial calculations
- `src/charts.ts` — Chart.js chart setup
- `src/ui.ts` — DOM manipulation, KPI rendering, table generation
- `src/types.ts` — shared types
- `src/constants.ts` — fixed constants (tax rates, fees, etc.)
- `src/__tests__/calculator.test.ts` — unit tests
- `dist/index.js` — compiled output

## Build

```sh
bun build src/index.ts --outdir dist
```
