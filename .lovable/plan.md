## BinSirin.com — Rebrand + Pre-Launch Upgrade Plan

Big scope. I'll ship this in 4 sequential phases so each is reviewable and reversible. Approve to start Phase 1; I'll pause between phases for your OK.

---

### Phase 1 — Rebrand to BinSirin (fast, low-risk)

**Meta / SEO**
- `index.html`: title → "BinSirin — Authentic Dream Interpretation by Ibn Sirin & Al-Nabulsi"; description, keywords, canonical, og:*, twitter:*, JSON-LD (`Organization` + `WebApplication`), `alternate hreflang` → all point to `https://binsirin.com`
- `public/manifest.json`, `public/sitemap.xml`, `public/robots.txt` → binsirin.com
- Update `mem://` core to reflect new brand name

**Visible UI**
- Header/Nav/Footer: "BinSirin" wordmark (custom serif) with "تفسير الأحلام" as tagline underneath
- Replace `Dream Companion` string everywhere (grep first, then batch edit)

**Brand mark**
- Generate a new logo (crescent + open book monogram, gold-on-midnight, matches existing gold/starfield palette)
- Save as `public/favicon.png` (delete `favicon.ico`), also use in Header
- New 1200×630 og-image with logo + tagline

---

### Phase 2 — Massive Dream Interpretation Database (SEO fuel)

**Sources (via Firecrawl connector — you'll link it)**
Legit public/large Arabic + English sources with Ibn Sirin content:
- `hurras.org`, `tafseer-alahlam.com`, `ibnsirin.net`, `dreamsnest.com/ibn-sirin`, and archive.org public-domain scans of Muntakhab al-Kalam & Ta'tir al-Anam

**Pipeline**
1. New edge function `scrape-dream-sources` — Firecrawl `map` → `crawl` per domain, extract symbol + interpretation + language + source URL
2. New table `symbol_interpretations` (symbol_slug, symbol_ar, symbol_en, interpretation_ar, interpretation_en, source_url, source_name, scholar) with GIN indexes on both text columns + unique(symbol_slug, source_url)
3. Dedup + normalize (Arabic diacritic stripping, lowercase slugs)
4. Admin-triggered ingest page at `/admin/ingest` (behind your existing admin role) — you kick off crawls, watch progress
5. Existing `interpret-dream` function gets a second retrieval step that also queries `symbol_interpretations`, weighted lower than the classical `dream_interpretations` table so Ibn Sirin/Nabulsi stay primary

**Legal safety rails**
- Store excerpt (≤300 chars) + link back to source ("Read full at [source]") — attribution, not republication
- `robots` respect + rate limiting in the crawler
- Public-domain classical texts stored in full; modern sites excerpted only

---

### Phase 3 — SEO Surface Expansion

**Per-symbol pages** (thousands of indexable URLs)
- Route `/symbol/:slug` (English) and `/رمز/:slug` (Arabic) via React Router
- Page shows: symbol name (EN/AR), all interpretations grouped by scholar/source, related symbols, cited sources with links
- Unique `<title>`, meta description, canonical, JSON-LD `DefinedTerm` per page — via `react-helmet-async`
- `scripts/generate-sitemap.ts` (predev+prebuild) fetches all symbol slugs from Supabase and writes a sitemap with every symbol URL in both languages

**Arabic-first mirror at `/ar`**
- Full RTL layout, Arabic UI strings, Arabic meta tags, hreflang crosslinks
- Landing, symbol pages, journal all available in Arabic

**Blog at `/blog` and `/ar/blog`**
- New table `blog_posts` (slug, title, content_md, lang, published_at, meta_description)
- Admin can generate drafts from a prompt (uses Lovable AI) → review → publish
- Article JSON-LD, sitemap entries

---

### Phase 4 — Launch Hardening

- React Router lazy loading (`React.lazy` on Journal/Auth/Admin/Blog)
- Image lazy loading + `loading="lazy"` audit
- Add Plausible analytics (privacy-friendly, no cookie banner needed) — you provide the site ID or I use `binsirin.com` default
- Sentry-lite error boundary + Supabase edge function error logging table
- PWA icons refresh, offline shell for `/` and `/symbol/*`
- Lighthouse pass: fix any CLS/LCP issues surfaced
- Trigger SEO scan before you publish

---

### Order of operations & checkpoints

1. **Phase 1 (rebrand)** — ~1 turn, no DB changes, safe to publish immediately
2. **Phase 2 (data)** — I'll first migrate the table, then ask you to link Firecrawl via the connector button, then build the ingest UI. You'll run the first crawl and approve results before I wire retrieval.
3. **Phase 3 (SEO pages)** — depends on Phase 2 data existing
4. **Phase 4 (hardening)** — final polish

### What I need from you now
- Approve this plan → I start Phase 1
- Confirm the source list in Phase 2 (or add/remove sites)
- Plausible: yes/no, and site ID if yes

**Reply "go" and I'll execute Phase 1.**