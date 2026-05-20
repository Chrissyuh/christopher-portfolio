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

## Checks

```sh
npm run lint
npm run build
npm run preview
```
