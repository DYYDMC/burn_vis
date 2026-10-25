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

To use it on the iPhone it has to be reachable from Safari, e.g. via GitHub Pages
(repo → Settings → Pages → deploy from `main`). Use it **in Safari**, not as a Home Screen app:
the Shortcut opens links in Safari, and Home Screen apps keep their own separate storage.

## Sync from Apple Health with a Shortcut

A web page can't read Apple Health, so a Shortcut reads it and opens the app with the numbers in the link:

```
https://<your-site>/#health=2026-10-01:412;2026-10-02:388;…
```

Each sync replaces the Health total for the days it sends, so running it several times a day is fine.

Build it in the Shortcuts app (new shortcut, name it **Sync Burn**):

1. **Find Health Samples**
   - Type: **Active Energy**
   - Filter: **Start Date** is after your goal's start date
   - Group By: **Day** (gives one total per day)
   - Sort by Start Date, no limit
2. **Repeat with Each** item in *Health Samples*:
   1. **Get Details of Health Sample** → **Start Date**
   2. **Format Date** → Custom, format `yyyy-MM-dd`
   3. **Get Details of Health Sample** (of *Repeat Item*) → **Value**
   4. **Round Number** → Ones place
   5. **Text**: `Formatted Date:Rounded Number` (insert the two variables with a colon between them)
3. **Combine Text** → *Repeat Results*, separator **Custom** `;`
4. **URL**: `https://<your-site>/#health=` followed by *Combined Text*
5. **Open URLs**

Units: the app expects kcal. If Health shows Active Energy in kJ, change the unit in
Health → Browse → Activity → Active Energy → Unit.

To sync automatically: Shortcuts → Automation → New → **Time of Day** (e.g. 21:30, daily) →
Run Shortcut *Sync Burn*, set to run immediately.

## Decisions

- **Design:** the melting fat block, with the trend chart underneath. Chosen from a three-variant
  UI prototype kept on the branch `prototype/burn-ui`.
- **What counts:** Apple Health **Active Energy**: all movement the Watch records, not only workouts.
  Manual entries (quick-add buttons) are added on top, for activity the Watch didn't record.
  Logging a Watch-tracked workout manually counts it twice.
- **Data source:** an iOS Shortcut that opens the app with per-day totals in the link (see above).
