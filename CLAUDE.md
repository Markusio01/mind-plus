# MIND+

Big ideas from great books as swipeable cards, with spaced recall so they stick.
A static PWA: vanilla JS, no build step, no backend, no dependencies. Sibling of FIT+ (same dark base, gold accent).

- **Live:** https://markusio01.github.io/mind-plus/ (GitHub Pages, `main` branch, repo root)
- **Repo:** https://github.com/Markusio01/mind-plus (public — Pages on the free plan needs it)
- **Progress** lives only on the phone, in `localStorage` under `mindplus.v1`. Nothing is sent anywhere.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | Shell. Loads `content/*.js`, then `js/app.js`. |
| `js/app.js` | Everything: state, views (Today / Library / Stash / You), reader, recall, onboarding. |
| `css/app.css` | Styles. All colours are tokens at the top. |
| `content/<shelf>.js` | The library. Each file pushes book objects onto `window.MIND_BOOKS`. |
| `sw.js` | Offline cache. **Bump `VERSION` on every deploy** or phones keep the old copy. |
| `tools/serve.py` | Local preview with caching off: `python3 tools/serve.py` → http://localhost:8791 |
| `tools/make_icons.py` | Regenerates `icons/` (needs Pillow). |

## Adding a book

Append an object to the right `content/<shelf>.js`:

```js
{
  id: 'short-slug', shelf: 'money', title: '…', author: '…', year: '2020',
  pal: 'forest', art: 'wave',            // keys of PAL / ART in js/app.js (cover colours + motif)
  tags: ['Investing', 'Psychology'],     // from TOPICS in js/app.js — drives recommendations
  star: true,                            // optional: pushes it up the recommendations
  blurb: "Two or three sentences on what the book is and why it matters.",
  ideas: [
    { t: "Headline, under ~50 characters",
      b: "The idea in 40–70 words: the claim, the mechanism, one concrete example.",
      a: "One concrete thing to try, under ~22 words.",
      q: "Optional quotation.", by: "Optional source" }
  ]
}
```

- Shelves are listed in `SHELVES` in `js/app.js`. A new shelf file must also go into `index.html` and `ASSETS` in `sw.js`.
- An idea's id is a hash of its headline. **Changing a headline orphans that idea's saved progress and stash entry.** Reordering or adding ideas is safe.

## Content rules

- Summaries are original writing: the book's ideas, never its sentences. No quotations from in-copyright books.
- `q` quotations come only from public-domain texts and are checked against the source wording
  (Meditations: George Long; Enchiridion: Elizabeth Carter; Seneca: R. M. Gummere; Art of War: Lionel Giles; The Prince: W. K. Marriott).
- Use curly quotes (’ “ ”) inside strings, never straight ones.

## Before shipping

```bash
node --check js/app.js && for f in content/*.js sw.js; do node --check "$f"; done
python3 tools/serve.py
```

The service worker is skipped on localhost so edits show immediately. Add `?sw=1` to the URL to test it there
(then unregister it in dev tools, or it will keep serving the cached copy).

## Deploy

1. Bump `VERSION` in `sw.js`.
2. Commit and `git push origin main`. Pages rebuilds in about a minute.
3. The phone picks up the new version the next time the app is opened online (it reloads itself once).
