# UnoMotors

UnoMotors is a static, multi-page vehicle dealership website for browsing vehicles and accessing financing, valuation, consignment, and company information.

## Features

- Responsive desktop and mobile navigation.
- Vehicle catalog backed by Supabase, with bundled mock data as a fallback.
- Vehicle detail pages with specifications, galleries, lightbox viewing, financing options, and contact CTAs.
- Financing, valuation, consignment, and company information pages.
- WhatsApp contact links and vehicle-specific inquiry messages.
- Optional AI chat interface backed by a configurable `/api/chat` service.
- SEO metadata, canonical URLs, Open Graph/Twitter metadata, sitemap, robots directives, favicons, and web manifest.
- Reduced-motion handling for scroll-based reveals.

## Technology

- HTML5, CSS3, and vanilla JavaScript.
- Supabase JavaScript client loaded from jsDelivr.
- Supabase database for published vehicle data.
- GitHub Pages-compatible static hosting with the custom domain declared in `CNAME`.

No frontend framework, package manager, build tool, or project-defined npm scripts is present in this repository.

## Local development

Serve the repository root with any static HTTP server. For example:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

The site should be served over HTTP rather than opened with `file://`, because catalog and chat requests use browser APIs that require an origin.

## Runtime configuration

The browser reads these values from `window` globals. Use placeholders in documentation and provide real values only through the appropriate deployment configuration:

```js
window.UNOMOTORS_SUPABASE_URL = "<SUPABASE_PROJECT_URL>";
window.UNOMOTORS_SUPABASE_ANON_KEY = "<SUPABASE_ANON_KEY>";
window.UNOMOTORS_AI_CHAT_API_URL = "<AI_CHAT_API_ORIGIN>";
```

The Supabase values enable the live catalog and vehicle detail queries. The mock data is available as a fallback. The AI chat setting points to the origin that exposes `/api/chat`; without it, the checked-in development fallback is `http://localhost:3000`.

## Project structure

```text
index.html             Main landing page and vehicle catalog
pages/                 Financing, valuation, consignment, company, and vehicle detail pages
css/                   Shared and page-specific stylesheets
js/                    Catalog, API, UI, gallery, vehicle detail, and chat modules
assets/                Images, logos, favicons, and other static media
supabase/migrations/   Database migration for vehicle image fields
CNAME                  GitHub Pages custom-domain declaration
robots.txt             Standard crawler directives
sitemap.xml            Public page sitemap
```

## Validation

This is a buildless static project. Useful checks are:

```bash
for file in js/*.js; do node --check "$file"; done
git diff --check
```

There are no repository-defined automated tests, lint scripts, or build scripts.

## Publication

The repository is prepared for GitHub Pages with `main` as the current branch and `CNAME` set to `unomotors.uy`. Configure GitHub Pages to publish the repository root from the intended branch, and verify the custom-domain setting in GitHub before publishing. No deployment workflow is checked in.
