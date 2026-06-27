# Google Sheet Content Setup

This site can read portfolio content from a published public Google Sheet. The deployed app ships with `src/content/portfolioContent.generated.json` as a fallback snapshot, then tries to fetch live sheet data in the browser.

## 1. Create The Sheet

Create one Google Sheet with these tabs and exact headers.

The `docs/google-sheet-template/` folder contains CSV files already populated with the current site content. Import or copy each CSV into a Google Sheet tab with the same file name, without the `.csv` suffix.

### Meta

`key,value`

Use one row per editable text value, such as `heroTitle`, `heroIntro`, `contactEmailHref`, or `footerName`.

### HeroTags

`id,order,enabled,label`

### CurrentStack

`id,order,enabled,number,label`

### EvidenceTiles

`id,order,enabled,top,bottom`

### MainProjects

`id,order,enabled,number,title,href,source_href,label,status,accent,summary,my_role,logo_src,logo_alt,logo_href,evidence_1,evidence_2,evidence_3,evidence_4,evidence_5,evidence_6,media_1_type,media_1_src,media_1_alt,media_1_caption,media_2_type,media_2_src,media_2_alt,media_2_caption,media_3_type,media_3_src,media_3_alt,media_3_caption,media_4_type,media_4_src,media_4_alt,media_4_caption,next,preview_title,preview_label,preview_part_1,preview_part_2,preview_part_3,preview_part_4,preview_part_5,preview_part_6`

Allowed `accent` values: `blue`, `teal`, `amber`, `clay`.

Leave `href`, `source_href`, `my_role`, `logo_src`, or `logo_href` blank when a main project should not show those fields.

Allowed `media_*_type` values: `photo`, `video`. Every enabled main project needs at least one media slot. Leave `media_*_src` blank to show a placeholder until a real image or video URL is ready.

### Academics

`id,order,enabled,label,value,note,highlight,asset_src,asset_alt`

Leave `note`, `highlight`, `asset_src`, or `asset_alt` blank when an academic card should only show the label and value. Set `highlight` to `gold` for the restrained gold rank-card accent.

### SmallProjects

`id,order,enabled,title,href,source_href,type,description,logo_src,logo_alt,logo_href,media_1_type,media_1_src,media_1_alt,media_1_caption,media_2_type,media_2_src,media_2_alt,media_2_caption,media_3_type,media_3_src,media_3_alt,media_3_caption,media_4_type,media_4_src,media_4_alt,media_4_caption,media_5_type,media_5_src,media_5_alt,media_5_caption,media_6_type,media_6_src,media_6_alt,media_6_caption,media_7_type,media_7_src,media_7_alt,media_7_caption,media_8_type,media_8_src,media_8_alt,media_8_caption`

Leave `href`, `source_href`, `logo_src`, or `logo_href` blank when a project should not show those fields. Every enabled small project needs at least one media slot.

### MicroProjects

`id,order,enabled,title,href,source_href,type,description,media_1_type,media_1_src,media_1_alt,media_1_caption,media_2_type,media_2_src,media_2_alt,media_2_caption,media_3_type,media_3_src,media_3_alt,media_3_caption,media_4_type,media_4_src,media_4_alt,media_4_caption`

C-level projects render as small photo-first tiles in the Bench Notes section. Every enabled micro project needs at least one media slot; leave `media_*_src` blank to show a placeholder until a real image is ready.

### SkillNarratives

`id,order,enabled,title,icon,text`

Allowed `icon` values: `arrowRight`, `bolt`, `box`, `cpu`, `gauge`, `github`, `layers`, `link`, `linkedin`, `list`, `mail`, `printer`, `route`, `school`, `target`, `trophy`, `wrench`, `zap`.

### Skills

`id,order,enabled,name`

### FullRecordSections

`id,order,enabled,category,icon`

### FullRecordItems

`id,section_id,order,enabled,text`

`section_id` must match an `id` in `FullRecordSections`.

### NavLinks

`id,order,enabled,label,href`

## 2. Publish CSV URLs

For each tab:

1. In Google Sheets, use `File -> Share -> Publish to web`.
2. Choose the tab.
3. Choose `Comma-separated values (.csv)`.
4. Copy the published URL.
5. Paste it into `src/content/googleSheetConfig.js` for the matching tab.

The sheet should only contain public portfolio content. Do not put private data in the sheet.

## 3. Update The Static Snapshot

After editing sheet URLs or content, run:

```sh
npm run sync-content
```

That command validates every tab and writes `src/content/portfolioContent.generated.json`.

## 4. Live Runtime Behavior

- If all tab URLs are configured, the browser fetches live sheet CSV after the page loads.
- If the live fetch succeeds and validates, the visible site updates without a redeploy.
- If fetch or validation fails, the site keeps using the generated JSON snapshot.
- If no URLs are configured, the site simply uses the generated snapshot.
