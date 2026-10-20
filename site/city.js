// The city — every fact that makes this calendar Salem's rather than
// another town's, in one place (2026-10-20: built on the Eugene site's
// pattern). The browser (filter.js, app.js) and the build (scripts/*.mjs)
// both read it; nothing else names a venue or a team. The shared files
// (app.js, filter.js, styles.css bar its --v-* hues, scripts/*.mjs bar
// fetch-events.mjs and sources.mjs) are lqa-events' own, byte for byte —
// see README "Sister sites".
//
// Loaded before filter.js (a plain script, so the tests can share it): it
// sets globalThis.LQACity (the name is the shared code's, not the city's).
(function (global) {
  'use strict';

  // The home teams, matched on the event title whatever the venue. Order =
  // the Teams strip, left to right. Salem has no club of its own on any
  // feed (the Marion Berries' West Coast League season has no published
  // schedule feed, and Willamette and Corban play below ESPN's coverage), so
  // these are the campus clubs the valley drives to — Oregon State in
  // Corvallis, 35 miles south, then Oregon in Eugene — as a Teams-view-only
  // list: their grounds are not venues here and there is no `inject`
  // (the Port Angeles pattern). Per team:
  //   re        the title match; venue the home building; sport keys the
  //             strip icon and the game clock; colors [primary, accent];
  //   season / form  where the schedule and the record come from (ESPN)
  //   club      the club's name on Ticketmaster; wiki the article; opens
  //             when the season usually starts
  var TEAMS = [
    // Oregon State Beavers football, Pac-12, Reser Stadium (Corvallis) — Ticketmaster lists the home Saturdays
    { slug: 'beavers', label: 'Beavers', name: 'Oregon State Beavers', abbr: 'ORST', re: /oregon state (beavers )?football|\bbeavers\b(?!.*(basketball|volleyball|softball|soccer|baseball|wrestling|gymnastics))/i, sport: 'football', venue: 'Reser Stadium', colors: ['#dc4405', '#000000'],
      espn: { sport: 'football', league: 'college-football', id: '204' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/204.png', schedule: 'https://osubeavers.com/sports/football/schedule',
      club: 'Oregon State Beavers Football', opens: 'late August', wiki: { title: 'Oregon State Beavers football', teamPage: true } },
    // Oregon State Beavers men's basketball, Pac-12, Gill Coliseum — Ticketmaster lists the home games
    { slug: 'beaversbasketball', label: 'Beavers Basketball', name: 'Oregon State Beavers', abbr: 'ORST', re: /oregon state (beavers )?men'?s basketball|oregon state (beavers )?basketball(?!.*women)/i, sport: 'basketball', venue: 'Gill Coliseum', colors: ['#dc4405', '#000000'],
      espn: { sport: 'basketball', league: 'mens-college-basketball', id: '204' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/204.png', schedule: 'https://osubeavers.com/sports/mens-basketball/schedule',
      club: "Oregon State Beavers Men's Basketball", opens: 'early November', wiki: { title: "Oregon State Beavers men's basketball", teamPage: true } },
    // Oregon Ducks football, Big Ten, Autzen Stadium — Ticketmaster lists the home Saturdays
    { slug: 'ducks', label: 'Ducks', name: 'Oregon Ducks', abbr: 'ORE', re: /oregon (ducks )?football|\bducks\b(?!.*(basketball|volleyball|softball|soccer|baseball|track))/i, sport: 'football', venue: 'Autzen Stadium', colors: ['#154733', '#fee123'],
      espn: { sport: 'football', league: 'college-football', id: '2483' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2483.png', schedule: 'https://goducks.com/sports/football/schedule',
      club: 'Oregon Ducks Football', opens: 'late August', wiki: { title: 'Oregon Ducks football', teamPage: true } },
    // Oregon Ducks men's basketball, Big Ten, Matthew Knight Arena — Ticketmaster lists the home games
    { slug: 'ducksbasketball', label: 'Ducks Basketball', name: 'Oregon Ducks', abbr: 'ORE', re: /oregon (ducks )?men'?s basketball|oregon (ducks )?basketball(?!.*women)/i, sport: 'basketball', venue: 'Matthew Knight Arena', colors: ['#154733', '#fee123'],
      espn: { sport: 'basketball', league: 'mens-college-basketball', id: '2483' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2483.png', schedule: 'https://goducks.com/sports/mens-basketball/schedule',
      club: "Oregon Ducks Men's Basketball", opens: 'early November', wiki: { title: "Oregon Ducks men's basketball", teamPage: true } },
    // Oregon Ducks women's basketball, Big Ten, Matthew Knight Arena — Ticketmaster lists the home games
    { slug: 'duckswomens', label: 'Ducks Women', name: 'Oregon Ducks', abbr: 'ORE', re: /oregon (ducks )?women'?s basketball/i, sport: 'basketball', venue: 'Matthew Knight Arena', colors: ['#fee123', '#154733'],
      espn: { sport: 'basketball', league: 'womens-college-basketball', id: '2483' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2483.png', schedule: 'https://goducks.com/sports/womens-basketball/schedule',
      club: "Oregon Ducks Women's Basketball", opens: 'early November', wiki: { title: "Oregon Ducks women's basketball", teamPage: true } },
  ];

  // The venues, one record each, by size. Per venue:
  //   capacity how many people the place holds
  //   area     absent = Salem proper; 'town' = Keizer, the panel's second group
  //   type     the event type when the title decides nothing
  //   cssVar   the hue styles.css sets for it (dark block --v-*); color
  //            the same hue as a value, for the series graph
  //   url      the venue's own events listing — not a ticket vendor
  //   icon     a mark for listings without a team crest
  //   tm       its Ticketmaster Discovery listing (fetch-events.mjs reads
  //            the venue by id — every page; several ids comma-joined read as
  //            one). exclude drops the parking, suites, tours and bundles
  //   alias    the other spellings the feeds use for it, folded to this name
  //   feed     the room's own calendar, read by scripts/feeds.mjs
  // Scouted and left out (README "Sources scouted"): Salem's Historic Grand
  // Theatre (no listing of its own found; resellers only), the Willamette
  // Heritage Center (its Events Calendar REST answers 403), The Reed (its
  // feed lists nothing), Willamette University's events app (no feed), the
  // Salem Convention Center (a hotel microsite), the Salem Art Association
  // (Humanitix), Corban (SeatGeek) and the Marion Berries (Wix, no schedule
  // feed).
  var TM_EXCLUDE = /season tickets?|parking|suite|\btours?\b|ticket packages?|vip (upgrade|package|tailgate)|club (level|seating)|^half price:|\b\d+[- ]day pass|grounds pass|all[- ]session|mini[- ]plan/i;
  var VENUES = {
    // --- Salem: the fairgrounds and its amphitheatre, the Elsinore, the symphony's auditorium, Pentacle, the derby ---
    'Oregon State Fairgrounds': { // the Oregon State Fair & Exposition Center: the fair, the Pavilion, the expos and the touring shows
      capacity: 10000,
      type: 'community',
      cssVar: '--v-fairgrounds',
      color: '#eadb86',
      url: 'https://oregonstatefairgrounds.com/events/',
      icon: 'https://www.google.com/s2/favicons?domain=oregonstatefairgrounds.com&sz=128',
      tm: { id: 'KovZpZAJlvnA', match: '', fallbackUrl: 'https://oregonstatefairgrounds.com/events/', exclude: TM_EXCLUDE },
      alias: /oregon state fair|state fairgrounds|exposition center/i,
    },
    'LB Day Amphitheatre': { // the fairgrounds' 8,000-seat summer shed — the season runs June to September
      capacity: 8000,
      type: 'concert',
      cssVar: '--v-lbday',
      color: '#a4ea86',
      url: 'https://oregonstatefairgrounds.com/events/',
      icon: 'https://www.google.com/s2/favicons?domain=oregonstatefairgrounds.com&sz=128',
      tm: { id: 'KovZpap5Fe', match: 'lb day', fallbackUrl: 'https://oregonstatefairgrounds.com/events/', exclude: TM_EXCLUDE },
      alias: /l\.?\s?b\.? day/i,
    },
    'Elsinore Theatre': { // the 1926 Tudor-Gothic movie palace on High Street: touring acts, comedy, the silent films on the Wurlitzer — Ticketmaster under two ids
      capacity: 1290,
      type: 'arts',
      cssVar: '--v-elsinore',
      color: '#ea8686',
      url: 'https://www.elsinoretheatre.com/',
      icon: 'https://www.google.com/s2/favicons?domain=www.elsinoretheatre.com&sz=128',
      tm: { id: 'ZFr9jZkddk,KovZpa6cne', match: 'elsinore', fallbackUrl: 'https://www.elsinoretheatre.com/', exclude: TM_EXCLUDE },
      alias: /elsinore/i,
    },
    'Rose Auditorium': { // the Oregon Symphony's Salem series, on Church Street SE
      capacity: 1100,
      type: 'arts',
      cssVar: '--v-rose',
      color: '#86c0ea',
      url: 'https://www.orsymphony.org/',
      icon: 'https://www.google.com/s2/favicons?domain=www.orsymphony.org&sz=128',
      tm: { id: 'Z7r9jZakNl', match: 'rose', fallbackUrl: 'https://www.orsymphony.org/', exclude: TM_EXCLUDE },
      alias: /rose auditorium/i,
    },
    'Pentacle Theatre': { // the community theatre in the West Salem hills since 1954 — its Spektrix box office (`spektrix`), every performance
      capacity: 199,
      type: 'arts',
      cssVar: '--v-pentacle',
      color: '#86eabe',
      url: 'https://pentacletheatre.org/',
      icon: 'https://www.google.com/s2/favicons?domain=pentacletheatre.org&sz=128',
      feed: { kind: 'spektrix', url: 'https://system.spektrix.com/pentacletheatre/api/v3', link: 'https://purchase.pentacletheatre.org/EventAvailability?EventId={id}', drop: /acting class|class\b|audition|season reveal|gift card/i },
      alias: /pentacle/i,
    },
    'The Madhouse': { // Cherry City Roller Derby's track — its bouts on Stranger Tickets (FEEDS, `boldtype`)
      capacity: 500,
      type: 'sports',
      cssVar: '--v-madhouse',
      color: '#a286ea',
      url: 'https://www.strangertickets.com/',
      icon: 'https://www.google.com/s2/favicons?domain=www.strangertickets.com&sz=128',
      alias: /\bmadhouse\b/i,
    },
    // --- Keizer ---
    'Roto-Rooter Park': { // Keizer's ballpark on Field of Dreams Way, the old Volcanoes Stadium
      capacity: 4254,
      type: 'sports',
      area: 'town',
      cssVar: '--v-rotorooter',
      color: '#ea86dc',
      url: 'https://www.ticketmaster.com/roto-rooter-park-tickets-keizer/venue/ZFr9jZea7d',
      icon: 'https://www.google.com/s2/favicons?domain=www.ticketmaster.com&sz=128',
      tm: { id: 'ZFr9jZea7d', match: '', fallbackUrl: 'https://www.ticketmaster.com/', exclude: TM_EXCLUDE },
      alias: /roto-?rooter park|volcanoes stadium/i,
    },
  };

  // City-wide feeds (scripts/feeds.mjs): Stranger Tickets, kept to the
  // Madhouse — the box office files Salem among its Oregon towns, so the
  // Venue cell's room and town decide (the Everett pattern)
  var FEEDS = [
    { kind: 'boldtype', label: 'Stranger Tickets', url: 'https://www.strangertickets.com', city: '', rooms: /madhouse.*\bSalem, OR\b/i, venue: 'The Madhouse', type: 'sports', drop: /season (?:tickets?|pass(?:es)?)|gift card/i },
  ];

  // The usual view: every room on
  var DEFAULT_ON = ['Oregon State Fairgrounds', 'LB Day Amphitheatre', 'Elsinore Theatre', 'Rose Auditorium', 'Pentacle Theatre', 'The Madhouse', 'Roto-Rooter Park'];
  var DEFAULT_OFF = [];
  var PREFS_KNOWN_FROM = null; // no default-off venue yet, so nothing for saved prefs to be told about

  // Event types: every event lands in exactly one, from its flags, title,
  // then venue. The rows the panel shows, in order.
  var TYPES = [
    { key: 'concert', label: 'Concerts', title: 'Live music — the Elsinore, the LB Day Amphitheatre, the fairgrounds' },
    { key: 'sports', label: 'Sports', title: 'Roller derby at the Madhouse, the ballpark in Keizer, and the Beavers and the Ducks' },
    { key: 'arts', label: 'Arts & Theater', title: 'The Elsinore, the Oregon Symphony at the Rose, Pentacle Theatre' },
    { key: 'community', label: 'Community', title: 'The fairgrounds — the State Fair, expos, shows' },
  ];
  var MOVIE_VENUE = null; // no cinema here

  // Share codes (?f=CODE): REGISTRY is every filterable key in a fixed
  // order and a code is a bitmask over it, so the list is APPEND-ONLY —
  // adding an entry adds a bit and every existing code keeps meaning what
  // it meant; removing or reordering one changes every link out there.
  // 20 slots from the first build: 4 base-36 digits.
  var CODE_LENGTH = 4;
  var REGISTRY = [
    ['venue', 'Oregon State Fairgrounds'], ['venue', 'LB Day Amphitheatre'], ['venue', 'Elsinore Theatre'], ['venue', 'Rose Auditorium'], ['venue', 'Pentacle Theatre'], ['venue', 'The Madhouse'], ['venue', 'Roto-Rooter Park'],
    ['badge', 'concert'], ['badge', 'sports'], ['badge', 'arts'], ['badge', 'community'],
    ['team', 'beavers'], ['team', 'beaversbasketball'], ['team', 'ducks'], ['team', 'ducksbasketball'], ['team', 'duckswomens'],
    ['cap', 'stadium'], ['cap', 'arena'], ['cap', 'hall'], ['cap', 'room'],
  ];

  // The words the page uses for the place
  var WORDS = {
    teamCity: 'Salem', // the board drops it from the clubs' names
    presetDefault: 'Every room — the fairgrounds, the LB Day Amphitheatre, the Elsinore, the Rose, Pentacle, the Madhouse and Keizer — every team and type',
    presetNeighborhood: 'Salem proper only — the fairgrounds, the LB Day, the Elsinore, the Rose, Pentacle and the Madhouse',
    presetBig: 'Only the places that hold 2,000 or more — the fairgrounds, the LB Day Amphitheatre and the ballpark in Keizer',
    phrases: { all: 'Showing everything.', none: 'Showing nothing yet — open Filter and pick some venues.', neighborhood: 'Showing Salem proper only.', big: 'Showing the big rooms only — the fairgrounds, the LB Day and the Keizer ballpark.' },
  };

  // Oregon's public holidays (app.js holidaysFor reads this instead of its
  // Seattle list): the federal set without Columbus Day, which Oregon does
  // not observe.
  function nthWeekday(y, month, weekday, n) { var d = new Date(y, month, 1); while (d.getDay() !== weekday) d.setDate(d.getDate() + 1); d.setDate(d.getDate() + (n - 1) * 7); return d; }
  function lastMonday(y, month) { var d = new Date(y, month + 1, 0); while (d.getDay() !== 1) d.setDate(d.getDate() - 1); return d; }
  var HOLIDAYS = function (y) {
    return [
      [new Date(y, 0, 1), "New Year's Day"],
      [nthWeekday(y, 0, 1, 3), 'Martin Luther King Jr. Day'],
      [nthWeekday(y, 1, 1, 3), "Presidents' Day"],
      [lastMonday(y, 4), 'Memorial Day'],
      [new Date(y, 5, 19), 'Juneteenth'],
      [new Date(y, 6, 4), 'Independence Day'],
      [nthWeekday(y, 8, 1, 1), 'Labor Day'],
      [new Date(y, 10, 11), 'Veterans Day'],
      [nthWeekday(y, 10, 4, 4), 'Thanksgiving'],
      [new Date(y, 11, 25), 'Christmas Day'],
    ];
  };

  global.LQACity = {
    key: 'salem',
    name: 'Salem',
    site: 'https://salem.here.events/',
    userAgent: 'Mozilla/5.0 (compatible; salem-events/1.0; +https://salem.here.events/)',
    tz: 'America/Los_Angeles', tzName: 'Pacific', // the city's time zone: the ICS feed's TZID, the game clocks, the poster's footer
    state: 'Oregon', stateOutline: null, // no state drawing (the masthead's state strip went away 2026-10-13)
    // the calendar feed's header; the UID domain never changes (changing it
    // re-creates every event in subscribers' calendars)
    ics: { name: 'Salem Events', short: 'Salem Events', teams: 'Salem-area teams — every season', prodid: '-//here.events//salem-events//EN', uidDomain: 'fosdal.net', // the UID domain the whole family issues (the shared ics test pins it)
      desc: 'Upcoming events in Salem\, OR — the Oregon State Fairgrounds\, the LB Day Amphitheatre\, the Elsinore Theatre\, the Rose Auditorium\, Pentacle Theatre\, the Madhouse and Keizer' },
    teams: TEAMS,
    venues: VENUES,
    feeds: FEEDS,
    defaultOn: DEFAULT_ON,
    defaultOff: DEFAULT_OFF,
    prefsKnownFrom: PREFS_KNOWN_FROM,
    types: TYPES,
    movieVenue: MOVIE_VENUE,
    groundsVenue: null, // every listing is read by room (or pinned to one), so nothing arrives under a name city.js lacks
    codeLength: CODE_LENGTH,
    registry: REGISTRY,
    words: WORDS,
    holidays: HOLIDAYS,
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
