# Bharat.Pulse — Claude Code Guide

Independent investment research publication platform. Solo author, no backend.

## Commands

```bash
npm run dev      # Vite dev server (localhost:5173) — includes /api/articles middleware
npm run build    # Production build → dist/
npm run preview  # Preview the dist/ build locally
```

## Architecture

**No framework, no backend.** Vanilla JS + Vite + Vercel. GitHub is the database.

### Pages (each is an independent Vite entry point)
| Page | HTML | JS | Purpose |
|------|------|----|---------|
| Homepage | `index.html` | `src/main.js` | Article grid, category filter, search |
| Article | `article.html` | `src/article.js` | Article reader, progress bar, TOC, SEO |
| Admin | `admin.html` | `src/admin.js` | CMS: write, edit, publish articles |

### Core modules
| File | Role |
|------|------|
| `src/renderer.js` | Renders block array → HTML. Single `renderBlocks(blocks)` export. |
| `src/parser.js` | Smart parser: converts raw prose → block array |
| `src/data/articles.js` | Hardcoded articles (legacy / examples) |
| `src/data/published.json` | Live articles — committed by GitHub API, triggers Vercel rebuild |

### Block types
Every article is an array of typed blocks. Defined in `renderer.js`:

| Type | Fields | Renders as |
|------|--------|-----------|
| `paragraph` | `text`, `dropCap` | `<p class="prose">` |
| `pullquote` | `text` | Indented quote |
| `stats` | `cells[{num, unit, label}]` | 1–3 column data callout |
| `section` | `num`, `heading` | Section break + `<h2>` with anchor id |
| `annotation` | `title`, `text` | Aside box |
| `timeline` | `items[{year, text}]` | Vertical timeline |
| `verdict` | `label`, `title`, `body`, `prompt` | Conclusion box with optional discussion button |
| `image` | `src`, `alt`, `caption` | `<figure>` with lazy-loaded `<img>` |

## Data flow

```
Write in Admin → Save Draft (localStorage)
              → Publish:
                  1. GitHub API → commits published.json → Vercel auto-deploys (~1 min)
                  2. Dev server /api/articles → writes published.json locally (dev only)
                  3. localStorage fallback (no sync across devices)

Reader loads article:
  getAllArticles() merges: hardcoded + published.json + localStorage fallback
  Article page: ?id=<slug> → find in merged list → render blocks
```

## Publishing workflow

1. Write in `/admin`
2. Add GitHub token in Settings panel (stored in `localStorage`, needs `contents:write` on this repo)
3. Click "Publish to Site" → commits `src/data/published.json` → Vercel rebuilds
4. Article appears on site within ~60 seconds

## Article IDs

New articles get slug-based IDs: `title-slug-xxxx` (last 4 chars of `Date.now().toString(36)`).
Legacy articles have `article-{timestamp}` IDs — both formats work fine.

## Security notes

- Admin password is hardcoded in `src/admin.js` (`ADMIN_PW`). Since this repo is public on GitHub, treat the admin URL as the security boundary — the page is not linked from the public site.
- GitHub token is stored in `localStorage` — never commit it. It is masked in the UI after saving.
- All user-facing content goes through `esc()` in `renderer.js` — no XSS from article content.
- Image block `src` values are URLs typed by the author (trusted input path).

## Key patterns

**Adding a new block type:**
1. Add default template to `defaultBlock` in `admin.js`
2. Add form UI in `blockForm()` switch in `admin.js`
3. Add HTML renderer in `block()` switch in `renderer.js`
4. Add button to `#block-menu` in `admin.html`
5. Add any new CSS to `src/style.css`

**Article schema:**
```js
{
  id: string,          // slug-based, e.g. "airtel-africa-multibagger-a3f2"
  issue: string,       // "01", "02", ...
  category: string,    // "Emerging Markets", "India Macro", etc.
  title: string,
  subtitle: string,    // one-line thesis
  author: string,
  date: string,        // "YYYY-MM-DD"
  readTime: string,    // minutes, auto-calculated from word count
  blocks: Block[],
}
```

## Deployment

- Host: Vercel (auto-deploy on push to `main`)
- Repo: `prarabdha-soni/Nishu-research`
- Config: `vercel.json` rewrites `/article` → `article.html`, `/admin` → `admin.html`
- Build output: `dist/` (gitignored, Vercel builds from source)

## What to avoid

- Don't add frameworks (React, Vue, etc.) — vanilla JS is intentional, keeps bundle tiny
- Don't add a backend or database — GitHub API is the persistence layer by design
- Don't store secrets in code — GitHub tokens belong in localStorage (admin only)
- Don't modify `dist/` directly — it's built by Vite
- Don't use `innerHTML` with unsanitized user content — always go through `esc()` in renderer.js
- Don't add type annotations, docstrings, or comments to code you didn't change
