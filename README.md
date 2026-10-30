# shaownak.github.io

Portfolio for Shaownak Shahriar — robotics and autonomous systems engineer.
Presented as a **technical datasheet**: light, gridded, information-dense,
full-colour photography.

Static files only. No framework, no build step, and **no third-party requests at
runtime** — fonts are self-hosted, images are local, nothing is fetched from a CDN.

## Layout

```
index.html              all content; nothing is rendered by JS
css/tokens.css          @font-face, surfaces, ink ramp, signal colour, 4px spine
css/main.css            everything else. Loads after tokens.css.
js/main.js              scroll arrivals: figures settle, section rules draw
js/lidar.js             the hero point cloud: canvas 2D, no library, ~14 KB
fonts/                  IBM Plex woff2, latin subset (SIL OFL 1.1, LICENSE.txt)
img/                    generated AVIF/WebP/JPEG at 400 / 720 / 1160 px
img/certs/              certificate scans at 400 / 600 / 800 px, plus -full.jpg
img/g/                  detail-sheet gallery images at 400 / 800 / 1400 px
img/logos/              organisation marks at 80 / 160 px
js/sheets.js            opens the <dialog> detail sheets
js/nav.js               marks the section you are reading, in both navs
js/theme.js             wires the light/dark switch (the theme is set in <head>)
robots.txt              crawl rules; points at the sitemap
sitemap.xml             one URL — the site is one page
404.html                styled, noindex, shares the theme script
favicon.ico             16/32/48 — the icon Google shows in search results
favicon.svg             same mark, for modern browsers
og.jpg                  1200x630 social card
apple-touch-icon.png    matches the inline SVG favicon in index.html
tools/build-images.py   regenerates everything in img/ from _src/
_src/                   original photographs and certificate scans — never published
```

`_src/` is version-controlled but not served: Jekyll skips directories beginning
with an underscore, so no `.nojekyll` file is wanted here.

## Design rules

- **One interface colour, three domain colours.** `--sig` (electric indigo) is the
  interface: links, buttons, navigation, emphasis. Alongside it, `--air` (sky),
  `--land` (amber) and `--water` (teal) encode which platform a thing belongs
  to. Mark an element with `data-domain="air|land|water"` and the colour follows
  into its small marks only — platform codes, figure IDs, the reference code
  on certificate and press cards, the date on table rows, the sheet header
  rule. Never a fill behind text, never body copy, never a fifth colour.
  The hero sentence teaches the key: "air, land and water" is set in the three
  colours. Certificate and press cards also *name* the domain after their code
  (`DOC-02 · Water`), so colour is never the only cue. Tag only things that
  genuinely belong to one platform: outreach, teaching and the programming
  contest stay neutral.
- **Four devices, no more**: the drawing title block, corner registration ticks
  on figures, leader-ruled spec rows, and mono reference codes (`PLT-01`,
  `SYS-03`, `FIG 04`).
- **One thing runs continuously: the hero point cloud.** An illustrative street
  as a 64-beam LiDAR sees it — ground rings, scan-line striping on objects,
  shadows behind them — with 3D detection boxes, the task of the GLE-SSD-VR
  thesis model. It is captioned "A demo of my work": a demo, not a recording.
  It is drawn from a fixed seed and must never be captioned as real model
  output. If a real KITTI frame and its detections are ever supplied, swap the
  generated points for those and the caption can say so. Canvas 2D, no
  library; capped at 30 fps; paused off-screen and in hidden tabs; a single
  still frame under reduced motion; hidden without JavaScript; hidden in
  print. Generic 3D (spinning shapes, a robot model, particle waves) was
  considered and rejected: decoration, and there is no model of the real
  vehicles to show.
- **Motion is a system, not a collection of effects.** One easing curve
  (`--ease`), and every movement is either a one-time arrival or a response to
  the cursor: nothing loops, nothing is tied to scroll position, nothing blocks
  reading. The hero arrives in reading order and is fully settled in ~1.2s; the
  name comes into focus (the one cinematic beat); the rule above the metrics is
  *plotted* left to right, and every section rule is drawn the same way as its
  section arrives — the drawing motif carried down the page. Photographs
  lean in 3% on hover inside a fixed frame; detail sheets rise in; the theme
  switch cross-fades. No parallax, no counters, no cursor effects, no
  scroll-jacking. `prefers-reduced-motion` turns all of it off and leaves every
  element in its final state; print does the same. The hero and sheets are
  CSS-only; `js/main.js` drives only the scroll arrivals and section rules.
- **Two themes, one palette structure.** Dark mode restates the same tokens on
  matte black and dark ash (`--bg:#0C0C0B`, `--bg-2:#171716`), neutral with no
  blue cast, never pure black: the hairlines have to stay visible and the white
  certificate scans must not glare. Photographs are
  untouched in both. The accent lifts from `#4F46E5` to `#9A93FF` because the
  light indigo fails AA on graphite — if you change one, recompute the other.
- **Blur is functional or absent.** It appears in exactly two places: the sticky
  top bar (so content passing under stays legible) and the modal backdrop (so an
  open sheet separates from the page). Decorative glass panels were considered
  and rejected — over `--bg` there is nothing behind to blur, so it costs
  compositing for an invisible effect, and softness contradicts a document whose
  whole argument is precision.
- **One header element, two shapes.** The same `.bar` markup is a full-height
  left sidebar at 1000px and above, and the horizontal top bar below that. There
  is no second nav in the DOM, so the active-section script has one set of links
  to mark. The base rule is `position:sticky`; the sidebar must override it to
  `fixed` or it will not run full height.
- **Every contact route is above the fold.** The `.hero-reach` strip under the
  lede carries email, LinkedIn, GitHub, WhatsApp and the CV. It is mono text on
  a hairline, not five filled buttons — coloured pills would break the
  one-accent rule. The footer keeps the full-address version; this is the
  shortcut for a reader who has already decided.
- **Photographs are never filtered.** The hardware is the evidence; show it.
- **Certificate scans are letterboxed, never cropped** (`object-fit: contain`).
  A document has to be shown whole to be evidence of anything.
- **Certificates are labelled by kind** — Award, Participation, Appreciation.
  Only three of the eight are awards; presenting the rest as though they were
  would devalue the ones that are.
- **The press record is plates, not a table.** It began as an index with a
  "View cutting" button on every row, which left the evidence behind a click —
  a press record whose cuttings are invisible is a list of claims. All nine
  items now show as plates carrying their own index line (outlet, subject,
  date), in the same boxed-ratio `object-fit:contain` component as `.certs`,
  so each document is shown whole rather than cropped to fit the grid.
- **Feni is told once.** The deployment section carried four press plates and a
  three-row table naming the same outlets, and all four plates repeated in the
  press gallery — a reader met the Daily Star cutting twice. It now keeps the
  narrative, the one cutting that names him, and a pointer to the full record.
  Do not re-add plates there; the gallery is the record. The section is one
  column (`.dep-solo`), not the 5/6 split the four-plate grid used — with one
  cutting the figure column stretched to the text's height and left 322px of
  dead space. One column also gives the cutting ~744px instead of 360px, which
  is the difference between recognising a masthead and reading the article.
- **Press cuttings must still be openable.** A newspaper page rendered at 399px
  is texture, not text — the Daily Star piece names Shaownak in a sentence that
  is invisible at plate size. Every cutting has a full-detail derivative and
  opens its own sheet, from the deployment plate (`.fig-open`) and from the
  press gallery (`.press-open`) alike.
- **Online courses are an index, never plates.** HackerRank and Coursera
  certificates sit in a compact table below the certificate grid, each opening
  its document on click. Giving them image cards would put a self-paced course
  at the same visual weight as a global competition podium, which is exactly the
  dilution the rebuild set out to remove.
- **No empty columns.** Where a table sat beside photographs and one column ran
  far longer than the other, the short side left a blank block. Measured at
  1440px: competitions 428px, Mongol-Tori 392px, teaching 242px, Banglalink
  227px. Fixed by layout, not padding: the two achievement blocks are
  `.dep-stack` (table full width, photographs in a row beneath); Mongol-Tori
  gained its second photograph like the other platforms; the Banglalink spec
  keeps five headline rows, with the full list in its detail sheet, and on
  desktop its screenshots take the gutter column too (`1/8`), which brought its
  gap from 167px to 57px. Stacked tables are capped at 880px, the same reading
  width as the roles table, so short rows are not stranded across 1300px. If you add
  a side-by-side block, compare where each column's content ends.
- **Experience comes first.** Order: Experience, Robotics platforms, Field
  deployment, Projects, Achievements, Certifications, Technical skills. The
  page used to open on the three university-team vehicles (2021–2024), which
  made the first impression "student". It now opens on the roles table and the
  Banglalink production system — the work of an employed engineer — with the
  platforms immediately after, still prominent. Employment and achievements
  are separate sections: competitions, teaching and press are not jobs.
- **Section names are the words a reader scans for.** The headings were once
  "Selected systems", "Capability index" and "Experience & recognition", which
  described the document rather than naming its contents; they are now
  Experience, Projects, Achievements and Technical skills. The reference codes
  (`PLT-*`, `SYS-*`, `DOC-*`, `PR-*`, `FIG *`) are the document's own language
  and stay — the headings are the reader's.
- **Colour on text is the signal colour only.** Section numbers, metric figures,
  `.hl` annotation marks and hover states. Never a second hue, and never more
  than a handful of `.hl` marks per page — if everything is highlighted, nothing is.
- **Technical skills are rows, never prose and never chips.** Grouped
  `label → value` rows, the same component as the platform specs. Prose hides
  what a reader is scanning for; a chip cloud is the 40-tag skills soup this
  rebuild removed. Grouped rows are neither.
- **Certificate cards degrade without JavaScript.** Each is a real
  `<a href="…-full.jpg">`; the script calls `preventDefault()` and opens the
  matching `<dialog>` instead. Keep the href — remove it and the cards break
  for anyone without JS.
- **Detail sheets are markup, not data.** Each project's `<dialog>` holds real
  HTML in index.html. Nothing is rendered from a JS object, so the content stays
  in the document for search engines and for readers without JavaScript.
- **Reference codes are stable.** `PLT-*`, `SYS-*` and `FIG *` are cited in the
  prose. Renumbering means re-reading the copy.

## Things that will bite you

- **`css/tokens.css` must load before `css/main.css`** — it carries the
  `@font-face` rules and every custom property.
- **The `.rise` hide is gated behind a `js` class** set by an inline script in
  `<head>`. Remove that script and visitors without JS see no figures. The rule
  uses `:where(.js)` so that the `prefers-reduced-motion` reset, which has the
  same specificity but comes later, still wins.
- **Certificate stems must not prefix one another.** `robosub-2023` is a prefix
  of `robosub-2023-award`; a naive srcset rewrite matched both and silently
  swapped two documents. If you script an edit over `img/certs/`, anchor the
  pattern on the `-<width>.<ext>` suffix.
- **`*{margin:0}` breaks dialog centring.** A modal `<dialog>` is centred by the
  UA stylesheet's `margin:auto`, which the reset at the top of main.css wipes —
  the sheet then pins to the top-left. `.sheet{margin:auto}` restores it. If you
  ever touch the reset, re-check that a sheet still opens centred.
- **The dialog `close` event is not dispatched by every engine.** It does not
  fire in the build this was tested against, so the scroll lock is pure CSS
  (`html:has(dialog.sheet[open])`). Do not reintroduce a JS class toggle keyed
  on `close` — a stuck lock freezes the page.
- **The sidebar is paid for by the gutter.** A 212px rail costs figure width on
  laptops, so `--gut` tightens from `clamp(20px,4.5vw,60px)` to
  `clamp(24px,2.6vw,40px)` at the same breakpoint. Net effect: the figure column
  goes 570px -> 481px at 1280, but *gains* at 1600 (578px -> ~598px) because the
  narrower gutter more than pays for the rail. Widen `--side` and you must
  re-check 1280.
- **Section heads are deliberately not sticky.** It was built and reverted: stuck
  under the bar they held 127px, 15.4% of a 1440x820 laptop screen, to report the
  current section — which the active mark in the nav already reports for free.
  Two solutions to one problem, and the expensive one also pinned `.sec-note`,
  which is framing meant to be read once. The only sticky elements are the top
  bar and the header inside an open sheet.
- **`sizes` attributes are hand-computed** from the grid (563px for a six-column
  figure, 269px for a paired press figure). If you change the column spans in
  `main.css`, recompute them or the browser will fetch the wrong resolution.
- **The favicon is three files, generated from one definition.**
  `tools/build-images.py` writes `favicon.svg`, `favicon.ico` (16/32/48) and
  `apple-touch-icon.png` from the same mark. It used to be an inline `data:`
  URI in `<head>`; browsers accept that, but **Google will not use a data URI
  for the icon beside a search result** — it needs a crawlable URL. Change the
  mark in `favicons()` and `touch_icon()` together, and re-run the script.
- **`google-site-verification` must survive every edit of `<head>`.** The token
  belongs to the existing Search Console property, carried over from the old
  single-file site. Delete it and the property has to be re-verified.

## Themes

The theme is applied by an inline script in `<head>`, before first paint —
reading it afterwards flashes the wrong surface. `js/theme.js` only wires the
button, so a slow network cannot cause that flash.

Three states, one button. **Nothing stored** means "follow the OS", which is the
default and where most visitors should stay; pressing the button writes an
explicit `light` or `dark` to `localStorage`. It never writes a value that
merely matches the current OS setting, so a visitor who has not chosen keeps
tracking their system when it flips from day to night.

The palette lives in `css/tokens.css` as **two byte-identical blocks** —
`@media (prefers-color-scheme:dark) :root:not([data-theme="light"])` for the OS
preference, and `:root[data-theme="dark"]` for an explicit choice. They are
generated together and must stay identical; edit one, edit both. With JS
disabled the media query still works, which is why `.bar-theme` is hidden
behind the `js` class — a dead control is worse than none.

## Deployment

Push to `Shaownak/shaownak.github.io`; GitHub Pages serves the root. There is no
build step for the site itself — `tools/build-images.py` is run by hand when a
photograph changes, and its output is committed.

Before pushing, confirm `_config.yml` still excludes `_src/`, `"n photos/"`,
`Certificates/` and `logos/`. Those hold the unredacted original of the
Banglalink monitoring screenshot, which shows identifiable faces and one
employee’s name and staff number. `robots.txt` repeats the exclusion; it is the
second lock, not the only one. **Never add `.nojekyll`** — it disables the
exclusion list and publishes all of it.

## Accessibility

Checked in both themes. Contrast is checked against both `--bg` and `--bg-2`. `--ink-3` is the lightest
colour permitted for text (4.7:1 on the tinted sections). `--ink-4` is below AA
and is reserved for non-text marks — do not set type in it.

There is a skip link as the first focusable element: the left rail holds eight
links, and tabbing past them on every visit is a tax. The active section is
carried by `aria-current="true"` as well as the accent mark, so the orientation
the sighted reader gets for free is not withheld from everyone else.

Every grid track that holds prose or a spec value is `minmax(0,1fr)`, never
`1fr`. A `1fr` track keeps `min-width:auto`, so one long unbreakable token — a
26-character email address, a caption, a nowrap badge — widens the track past
its share and pushes the row off the page. Three separate horizontal-scroll bugs
on this site were all that same mistake. If you add a grid with a text column,
use `minmax(0,…)`.

The domain colours are generated in OKLCH at one lightness and one chroma,
differing only in hue (air 235, land 58, water 178): L 0.505 / C 0.085 in light
mode, L 0.80 / C 0.075 in dark. Matching them is what makes them read as a
palette rather than four unrelated picks; the first version used stock
saturated tones and looked like a monitoring dashboard, neon in dark mode.
They clear 4.5:1 as text on every light surface and as a fill under `--bg`
text (air 4.8/5.6, land 5.0/5.8, water 4.7/5.4), and 8.5:1 or better in dark.
To adjust one, change its hue only and keep L and C, or the set falls apart.

The accent clears AA everywhere it is used: `--sig` is 6.1:1 on `--bg`, 5.7:1 on
`--bg-2`, and 5.2:1 on its own `--sig-3` tint (the `.hl` band and the `.outcome`
callout). Reversed — `--bg` on a `--sig` fill — it is 6.1:1. Re-check all four if
you ever change the accent.

Dark theme, same structure and the same rules: `--ink-3` is the lightest colour
permitted for text (5.2:1 on `--bg-3`, the worst case) and `--ink-4` stays below
AA and non-text only. The lifted accent `--sig` is 7.3:1 on `--bg`, 6.2:1 on
`--bg-3`, 5.7:1 on its own `--sig-3` tint, and 7.3:1 reversed. Note that the
reversed pairing in dark mode is `--bg` on a `--sig` fill, **not** `--ink` on
`--sig` — that one is 2.3:1 and fails badly. `.plat-code b`, `.sheet-code` and
`.sheet-close:hover` already set `color:var(--bg)`; keep it that way.

## Rebuilding images

```
python tools/build-images.py
```

`targets_for()` adds a rung at the source's own width whenever that is more than
15% larger than the biggest ladder rung that fits, so a 718px clipping is not
capped at the 400px rung and left unreadable.

Requires Pillow >= 11.3 for AVIF encoding. Re-run after changing a source photo
or adding a figure, then update the `srcset` and `width`/`height` in `index.html`.

## Local preview

```
python -m http.server 4173
```

Then open <http://localhost:4173>. Opening `index.html` over `file://` will not
load the stylesheets.
