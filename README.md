# Christopher Portfolio

React/Vite portfolio site for Christopher's engineering work, hardware projects, academics, and broader record.

## Run Locally

```sh
npm install
npm run dev
```

## Content Updates

The app renders from `src/content/portfolioContent.generated.json` by default. It can also fetch live content from a published public Google Sheet at runtime.

1. Create the sheet tabs and headers listed in `docs/google-sheet-content.md`.
2. Publish each tab as CSV.
3. Paste the published URLs into `src/content/googleSheetConfig.js`.
4. Run:

```sh
npm run sync-content
```

The generated JSON stays as the deployment-safe fallback if live Google Sheet loading fails.

## Smart Planter 3D Asset

The deployed GLB and poster are committed under `public/portfolio-media/smart-planter/`. Rebuild them from the current cost-down Board A STEP export and KiCad render with:

```sh
npm run build-pcb-model
```

The script uses the local Smart Planter workspace by default. Set `SMART_PLANTER_ROOT` or pass STEP and poster paths as the first two arguments when the source files move. Vercel serves the generated assets and does not run CAD conversion during deployment.

## Checks

```sh
npm run lint
npm run build
npm run preview
```
