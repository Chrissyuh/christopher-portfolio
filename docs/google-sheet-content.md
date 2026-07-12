# Google Sheet Content Setup

The deployed site currently uses `src/content/portfolioContent.generated.json`. Live Google Sheet updates are supported but are not enabled until every published tab URL is added to `src/content/googleSheetConfig.js`.

## Required Tabs

Import the CSV files from `docs/google-sheet-template/` into one public Google Sheet. Keep each file name as the tab name and preserve its headers.

- `Meta`: site labels, titles, links, and school context.
- `MainProjects`: featured-project status, summary, role, links, logo, and media.
- `ProjectArtifactLinks`: additional public project evidence links.
- `Academics`: GPA, rank, and coursework cards.
- `ProgramCredentials`: programs, credentials, logos, links, and certificate scans.
- `LearningHighlights`: non-academic learning statistics such as Duolingo.
- `SmallProjects`: additional project cards.
- `MicroProjects`: image-first small-build tiles.
- `Skills`: project-backed skills grouped by category.
- `SkillProjects`: validated links between a skill and either a featured project or program credential.
- `FullRecordSections`: Experience-page section headings.
- `FullRecordItems`: structured Experience entries.
- `NavLinks`: homepage navigation links.

Allowed project accents are `blue`, `teal`, `amber`, and `clay`. Allowed media types are `photo` and `video`. Every project must contain at least one media slot; a blank source renders the subdued documentation-needed state.

## Publish And Configure

For every tab, use `File -> Share -> Publish to web`, choose the individual tab, choose CSV, and copy the published URL. Add every URL to the matching entry in `src/content/googleSheetConfig.js`.

The runtime deliberately rejects partial configuration. Either all required URLs must be present or all should remain blank.

## Sync And Fallback

Run:

```sh
npm run sync-content
```

The command fetches every configured tab, validates IDs, relations, media types, icons, accents, and required fields, then writes the generated snapshot.

- With all URLs configured, the browser requests live CSV after rendering the snapshot.
- If fetching or validation fails, the generated snapshot remains visible.
- With no URLs configured, no live request is attempted and updates require a new snapshot plus deployment.

Only public portfolio information belongs in the sheet. Certificate scans and media should be stored as public site assets, not embedded private Drive links.
