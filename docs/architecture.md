# Architecture

Date: 2026-07-16

## Decision

Migrate the existing static party-game files to a static Astro site for a kaidan story library.

## Why Change the Technical Structure

The current site is a small hand-written static app with mojibake text and game-specific JavaScript. It has no article model, no generated routes, no SEO pipeline, no content validation, and no test/build automation. Keeping that structure would make hundreds of stories, category pages, search, RSS, sitemap, and metadata checks fragile.

Astro is a better fit because it can:

- Generate static HTML for every story, category, tag, and series page.
- Keep story body text readable by search engines without client JavaScript.
- Store stories in Markdown with typed frontmatter.
- Validate story metadata through Astro Content Collections.
- Add small client-side scripts only where needed for favorites, history, reading settings, and search helpers.
- Build cleanly for GitHub Pages.

## Target Stack

- Astro
- TypeScript
- Markdown story files
- Astro Content Collections
- Static site generation
- Pagefind-compatible static output
- `localStorage` for favorites, reading history, and display settings
- Node-based scripts for content checks and link checks
- GitHub Actions for install, lint, content check, test, and build
- GitHub Pages deployment workflow

## Site Map

```text
/
├── stories/
│   └── [slug]/
├── categories/
│   └── [slug]/
├── tags/
│   └── [slug]/
├── series/
│   └── [slug]/
├── ranking/
├── search/
├── random/
├── favorites/
├── history/
├── about/
├── submission-guidelines/
├── privacy/
├── terms/
├── copyright/
├── contact/
└── 404/
```

## Story Data Model

Each Markdown story must support these frontmatter fields:

```yaml
id:
title:
slug:
excerpt:
publishedAt:
updatedAt:
author:
mainCategory:
subCategories:
tags:
setting:
fearLevel:
lengthType:
estimatedReadingMinutes:
endingType:
series:
episodeNumber:
featured:
editorialScore:
contentWarning:
sourceType:
aiAssisted:
reviewStatus:
seoTitle:
seoDescription:
```

`sourceType` is restricted to:

- `original`
- `user-submission`
- `public-domain`
- `legend-explanation`
- `licensed`

`reviewStatus` is restricted to:

- `draft`
- `ai-generated`
- `checked`
- `edited`
- `approved`
- `published`
- `rejected`

Only `reviewStatus: published` stories should be listed publicly.

## Classification Axes

Stories are not locked to one category. The site uses multiple filter axes:

- Main category
- Subcategories
- Tags
- Setting
- Fear level
- Length type
- Ending type
- Series

Main navigation exposes the most common axes. Detail filters remain available on list/search pages so the interface does not become crowded.

## URL and Migration Policy

The current URLs are not kaidan content URLs and are not suitable as canonical public pages. They are preserved in Git history through the baseline commit. The new public site uses clean directory URLs.

If the old game pages must be restored later, they can be copied from commit `9da6f79` into a legacy archive path. They are intentionally not part of the new kaidan site.

## Design Direction

The visual direction is "Japanese kaidan plus digital archive":

- Black, sumi ink, dark gray, off-white, and restrained dark red.
- Readable Japanese system fonts for body copy.
- Sparse lantern/archive motifs, not aggressive horror decoration.
- No autoplay audio, jump scares, flashing, or fake alerts.
- Mobile reading comfort takes priority over decorative layout.

## SEO Model

Every generated public page should include:

- Unique title
- Unique description
- Canonical URL
- Open Graph metadata
- X card metadata
- Breadcrumbs where relevant
- Structured data appropriate to the page type
- Internal links to related content

Generated assets:

- `robots.txt`
- `sitemap.xml`
- `rss.xml`

## Search Model

The build emits static HTML that can be indexed by Pagefind. The `/search/` page contains:

- Search input
- Pagefind UI mount point
- Metadata-based filter links for common discovery paths

The site remains usable without search JavaScript because category, tag, series, and ranking pages are statically generated.

## Client-Side Reader Features

Client JavaScript is limited to:

- Favorites in `localStorage`
- Reading history in `localStorage`
- Reading progress bar
- Display settings
- Random-story selection helpers
- Search UI initialization

Article text is never client-rendered.

## Advertising Preparation

The MVP includes reusable ad slot components only. Real ad network IDs and analytics IDs are not hard-coded. Future IDs should be passed through environment variables or a small config file.

## Quality Gate

`npm run content:check` checks:

- Required metadata
- Duplicate titles
- Duplicate slugs
- Invalid date formats
- Too-short and too-long bodies
- Repeated phrases
- Similarity between local stories
- Placeholder text
- Missing image paths
- Invalid internal links

`npm run test` covers generated data helpers and localStorage-capable browser scripts where practical.

## GitHub Pages

The site is configured for static output and GitHub Pages. The base path is controlled by `PUBLIC_BASE_PATH`, so project pages and custom-domain pages can both be supported without hard-coded absolute local paths.
