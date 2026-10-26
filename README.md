# Burn Goal

Shows how many kcal you have left to burn before a goal date, as a block of fat that melts,
plus a cumulative chart with the goal date and goal kcal as red dashed lines.

Plain HTML/CSS/JS, no build step. Data is stored in the browser (`localStorage`) on the device you use.

## Run

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000>. (Opening `index.html` by double-click doesn't work: browsers block
JavaScript modules on `file://`.) Tests: <http://localhost:8000/tests.html>.

Live at <https://dyydmc.github.io/burn_vis/> via GitHub Pages (Settings → Pages → deploy from `main`, root;
no custom domain needed). Use it **in Safari**, not as a Home Screen app:
the Shortcut opens links in Safari, and Home Screen apps keep their own separate storage.

## Sync from Apple Health with a Shortcut

A web page can't read Apple Health, so a Shortcut reads it and opens the app with the numbers in the link:

```
https://<your-site>/#health=2026-10-01:412;2026-10-02:388;…
```

Each sync replaces the Health total for the days it sends, so running it several times a day is fine.

Setup steps for beginners, with a copy button for the link: open `sync-setup.html` on the site
(<https://dyydmc.github.io/burn_vis/sync-setup.html>), also linked from the app under the buttons.

## Languages

English and Mandarin (Simplified Chinese). Tap the flag in the top bar to switch; the choice is remembered in the browser.
On first visit the app follows the phone's language, falling back to English.

To add a language, copy `src/locales/en.js` to `src/locales/<code>.js`, translate the strings, and add it to `LANGS` in
`src/i18n.js`. `tests.html` checks that every language has the same keys as English.
The Shortcut setup guide (`sync-setup.html`) is English only.

## Decisions

- **Design:** the melting fat block, with the trend chart underneath. Chosen from a three-variant
  UI prototype kept on the branch `prototype/burn-ui`.
- **What counts:** Apple Health **Active Energy**: all movement the Watch records, not only workouts.
  Manual entries (quick-add buttons) are added on top, for activity the Watch didn't record.
  Logging a Watch-tracked workout manually counts it twice.
- **Data source:** an iOS Shortcut that opens the app with per-day totals in the link (see above).
