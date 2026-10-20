# Salem Events

Event feed and calendar for Salem, Oregon: the Oregon State Fairgrounds and its
LB Day Amphitheatre, the Elsinore Theatre, the Oregon Symphony at the Rose
Auditorium, Pentacle Theatre and Cherry City Roller Derby at the Madhouse, with
Keizer's ballpark (Roto-Rooter Park) as the "Keizer & Beyond" group — and the
valley's campus clubs (Beavers football and basketball, Ducks football, men's
and women's basketball) in a Teams view.

To be published at **https://salem.here.events/** (GitHub Pages, built by the
Actions workflow once a day at noon Pacific).

Built 2026-10-20 on the family's city pattern (template: eugene-events).
Everything that makes this Salem's is `site/city.js` (every team, venue, type,
default, share-code registry, holiday and string), `site/index.html`,
`scripts/fetch-events.mjs` (its source list), `site/embed.js`, `outlook.json`,
`scripts/data/postseason.json`, `channels.json`, the manifest and icons.
Everything else — `app.js`, `filter.js`, `styles.css` bar its `--v-*` hue
lines, the shared `scripts/*.mjs` and their tests — is lqa-events' own, byte
for byte, copied in by `sync-shared.sh` from the lqa-events project.

## Sources

- **Ticketmaster Discovery API** — the rooms Ticketmaster lists, each by its
  venue id (every page; the Elsinore reads two ids). Parking, suites, tours,
  VIP upgrades and season bundles are dropped per room (`tm.exclude`). Church
  events are left out (`isChurch`).
- **Pentacle Theatre** — its Spektrix box office's public API
  (`scripts/feeds.mjs` kind `spektrix`): one row per performance, classes and
  auditions dropped, a performance with no seats left tagged sold out.
- **Stranger Tickets** — the Bold Type box office's list (kind `boldtype`),
  kept to the Madhouse in Salem by the Venue cell and pinned to that row.
- **Seasons** — ESPN for the Beavers and the Ducks (Teams view only: their
  grounds are not venues here).

## Build

```
cp .env.example .env   # TICKETMASTER_API_KEY=… (a free Discovery key)
ALLOW_NO_ARCHIVE=1 node scripts/fetch-events.mjs   # writes site/events.json, the .ics feeds, teams.json
node --test scripts/*.test.mjs
python3 -m http.server 8000 --directory site
```

`ALLOW_NO_ARCHIVE=1` is only for the first build, before the `events-archive`
branch exists; in CI the workflow sets it as a repository variable until the
first run has pushed the archive, then it is deleted.

## Sister sites

lqa-events (Seattle Center) is the source of truth for the shared files. See
its README for the pipeline, the share codes and the Teams view.
