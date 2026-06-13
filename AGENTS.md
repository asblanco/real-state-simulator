# Real State Simulator

Frontend-only real estate investment simulator. Built with SvelteKit + Tailwind CSS.

## Commands

- `mise run install` — install dependencies
- `mise run build` — build SvelteKit app to `dist/`
- `mise run test` — run unit tests (excludes e2e)
- `mise run test-e2e` — run e2e tests (starts preview server on :8080)
- `mise run dev` — start Vite dev server with HMR
- `bun run preview` — preview production build locally

## Tech

- **Runtime:** Bun (not Node.js)
- **Framework:** SvelteKit (SPA, static adapter)
- **Testing:** `bun:test` (not jest/vitest)
- **Charts:** Chart.js
- **Styling:** Tailwind CSS v4 + daisyUI (via `@tailwindcss/vite`)

## Project Structure

### Core Logic (pure TypeScript, tested)
- `src/lib/calculator.ts` — financial calculations (purchase costs, yearly projections, summary)
- `src/lib/etf-calculator.ts` — ETF comparison calculations (rent vs buy model)
- `src/lib/constants.ts` — fixed constants (tax rates, fees, etc.)
- `src/lib/types.ts` — shared types
- `src/lib/__tests__/calculator.test.ts` — unit tests

### State Management (Svelte stores)
- `src/lib/stores/params.ts` — writable store for input parameters
- `src/lib/stores/computed.ts` — derived stores (purchaseCosts, years, summary, etfComparison, yearlyWealth)

### UI Components
- `src/lib/components/Chart.svelte` — Chart.js wrapper
- `src/lib/components/KpiCard.svelte` — KPI card with optional tooltip
- `src/lib/components/NavBar.svelte` — navigation tabs

### Routes (multi-view SPA)
- `src/routes/+layout.svelte` — app shell (header, sidebar sliders, navbar)
- `src/routes/+page.svelte` — Dashboard (KPIs + charts + table + math breakdown)
- `src/routes/etf/+page.svelte` — RE vs ETF comparison

### Internationalization
- `src/lib/i18n.ts` — Svelte store-based i18n
- `src/lib/locales/es.json`, `en.json`, `de.json`

## Key Architectural Decisions

- **SvelteKit with adapter-static** — static SPA output to `dist/`, deployable to GitHub Pages
- **Store-driven reactivity** — changing any slider instantly recomputes all derived data
- **Rent vs Buy ETF model** — compares property investment with renting + ETF investing
- **LocalStorage persistence** — input parameters saved between sessions
