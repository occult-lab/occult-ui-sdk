# occult-api-ui

Drop-in React components for the [Occult API](https://occultapi.com) — natal
data, dashas, tarot, Human Design, Chinese astrology and numerology, rendered
from live astrological calculations. No diagram-rendering service involved:
each component makes one API call for the numbers and draws everything
itself.

## Install

```bash
npm install occult-api-ui
```

## Use

```tsx
import { OccultProvider, PlanetPositions, CurrentDasha } from "occult-api-ui";
import "occult-api-ui/styles.css";

function App() {
  return (
    <OccultProvider apiKey={process.env.NEXT_PUBLIC_OCCULT_API_KEY}>
      <PlanetPositions
        date="1990-08-15"
        time="10:30"
        latitude={26.9124}
        longitude={75.7873}
        timezone={5.5}
        place="Jaipur, India"
      />
      <CurrentDasha date="1990-08-15" time="10:30" latitude={26.9124} longitude={75.7873} timezone={5.5} />
    </OccultProvider>
  );
}
```

**A key embedded in a shipped browser bundle is visible to anyone who opens
devtools.** Fine for a prototype; for production, proxy through your own
server (see the `occult-api-demo` pattern in this org) and point `baseUrl`
at your own endpoint instead.

## Components (41, all verified against a live API response — 40 working, 1 blocked by a confirmed backend bug)

| Component | Endpoint |
|---|---|
| `NatalChartWheel` | `/api/astro/planet-positions/` — North Indian diamond chart, any division via `chartName` (D-1 through D-144) |
| `SouthIndianChartWheel` | `/api/astro/planet-positions/` — fixed-sign 4×4 box layout, genuinely different geometry from North Indian |
| `Bodygraph` | `/api/astro/human-design/chart/` — full Human Design bodygraph: 9 centres, 36 channels, 64 gates |
| `MoonPhase` | `/api/astro/moon-illumination/` — a real crescent/gibbous disc computed from illuminated_fraction, not one of 8 fixed icons |
| `SynastryWheel` | `/api/astro/western/synastry/` — real 360° tropical wheel, two rings of planets, aspect lines colour-coded harmonious/challenging |
| `TransitBiWheel` | same endpoint as Synastry, natal vs. "right now" instead of two people — shares `WesternWheelBase`'s rendering, not a duplicate |
| `KpChartWheel` | `/api/astro/kp-chart/` — genuinely unequal Placidus-style cusps, not the fixed 30° diamond `NatalChartWheel` uses |
| `Sahams` | `/api/astro/sahams/` — Arabic Parts, 38 sensitive points |
| `Sect` | `/api/astro/traditional/sect/` — diurnal/nocturnal, sect benefic/malefic, in-sect/hayz per planet |
| `Almuten` | `/api/astro/traditional/almuten/` — essential-dignity-score winner for Sun/Moon/Asc/MC/Fortune |
| `EssentialDignities` | `/api/astro/traditional/dignities/` — domicile/exaltation/triplicity/term/face per planet |
| `AnnualProfection` | `/api/astro/traditional/profections/` — year/month/day lord by profected house |
| `SecondaryProgressions` | `/api/astro/western/progressions/` — "a day for a year", natal vs. progressed |
| `FixedStars` | `/api/astro/fixed-star/positions/` — **written but blocked**: this endpoint is confirmed 100% broken server-side (every preset, every explicit star name fails with a malformed comma-prefixed lookup). Not touched, since it's someone else's API code — will work once fixed upstream. |
| `AstrocartographyMap` | `/api/astro/astrocartography/lines/` — real AC/DC/MC/IC lines per planet over real coastlines (Natural Earth 110m, baked in at build time: no map dependency, no tile server, works offline) |
| `LocalSpaceMap` | `/api/astro/astrocartography/local-space/` — compass-direction lines from the birth place, verified against the azimuth table |
| `WesternNatalWheel` | `/api/astro/western/natal-chart/` + `/api/astro/house/` — single-person circular wheel with real Placidus cusps and self-aspects; the one wheel shape the library was missing (Synastry/Transit only ever draw two charts, KP has cusps but no aspects) |
| `Kabbalah`, `IChingNumerology`, `AngelNumberLookup` | dedicated `astro/numerology/{kabbalah,iching,angel}` endpoints — separate systems from the generic `NumerologyChart`, not reachable through it |
| `EphemerisTable` | `/api/astro/mundane/ingresses/` — sign changes and retrograde stations over a date range |
| `PlanetPositions` | `/api/astro/planet-positions/` |
| `VimshottariDasha` | `/api/astro/dasha/vimshottari/` |
| `CurrentDasha` | `/api/astro/dasha/current/` |
| `DashaTimeline` | any of 29 other named dasha systems — one generic component, see `DASHA_SYSTEMS` |
| `GunMilan` | `/api/astro/gun-milan/` |
| `Nakshatra` | `/api/astro/nakshatra/` |
| `Ashtakavarga` | `/api/astro/ashtakvarga/` |
| `Rashifal` | `/api/astro/rashifal/` (`get_daily_rashifal`) |
| `KpChart` | `/api/astro/kp-chart/` |
| `Doshas` | `/api/astro/dosha/` (6 of 10 keys — see the component's own doc comment for the 2 excluded backend bugs) |
| `TarotCard` / `TarotSpread` | `/api/astro/tarot/draw/` / `/spread/` |
| `TarotDeck` | `/api/astro/tarot/deck/` |
| `TarotYesNo` | `/api/astro/tarot/yes-no/` |
| `FourPillars` | `/api/astro/chinese/four-pillars/` |
| `BaziTenGods` | `/api/astro/chinese/bazi/` |
| `LuckPillars` | `/api/astro/chinese/luck-pillars/` |
| `ChineseZodiac` | `/api/astro/chinese/zodiac/` |
| `HumanDesignType` | `/api/astro/human-design/properties/` |
| `HumanDesignConnection` | `/api/astro/human-design/connection/` |
| `NumerologyChart` | `/api/astro/numerology/` (covers all 4 systems — chaldean/pythagorean/chinese/vedic — via `system` + `keys` props) |

`DashaTimeline` alone stands in for 29 separate RoxyAPI-style components
(Chara, Yogini, Kalachakra, Narayana, Sudasa and two dozen more — all share
one response shape, confirmed by reading the shared `shape()` method in
`astro_api/views/focused/dasha.py` rather than assumed), and
`NumerologyChart` covers roughly 30 more numerology keys across 4 systems the
same way. Counted that way this slice reaches most of RoxyAPI's ~100-item
catalogue; counted as distinct named components (RoxyAPI's own way of
counting) it's 21 of ~100.

Not yet built: the Human Design **bodygraph diagram** itself (needs porting
the SVG geometry already built for panchang-web — the heaviest remaining
piece), a South Indian chart style option, a divisional-chart version of
`NatalChartWheel` (D9/D10/etc — same component, different `chartName`, not
yet wired up), Western astrology (natal wheel, synastry, transits,
progressions, astrocartography — all backend-ready, not yet wrapped),
Shadbala/Bhava Bala, the yoga catalogue/detection endpoints, KP ruling
planets and significators, and Lal Kitab. Entirely absent from the backend,
not just unbuilt here: Mayan calendar, Vastu, Feng Shui, biorhythm, dream
symbols, crystal grids — those need a calculation engine built first, not
just a component.

**On diagrams specifically:** `/api/astro/planet-positions/` documents a
`render: "svg"` parameter that claims to return a rendered chart, but it
doesn't — tested directly, the parameter is silently accepted and no `svg`
field ever appears in the response. `NatalChartWheel` doesn't depend on it;
it draws the diamond client-side from the same plain numbers every other
component here uses, the same way the Human Design bodygraph will when it's
ported.

## Theming

Every colour is a `--occult-*` custom property; override any of them on a
parent element. Dark mode follows the operating system on its own, which is
what you want in an app with no theme switch of its own.

**If your app has its own light/dark switch, hand it the theme**, or the two
will disagree the moment a reader on a dark laptop picks light mode — black
cards on a white page:

```tsx
<div data-occult-theme={theme}>   {/* "light" | "dark", from your own theme state */}
  <PlanetPositions … />
</div>
```

`data-occult-theme` is read from any element, not just `:root`, so a themed
subtree works. Other useful knobs:

```css
--occult-table-max-height: 24rem;  /* caps long tables and scrolls them,
                                      with the header pinned. Unset, tables
                                      grow to their full height. */
```

Chart and wheel components take a `size` prop for their natural size, and
shrink to fit a narrower container on their own.

## Architecture

- **No Tailwind/shadcn dependency.** The package ships its own scoped CSS
  (`occult-*` classes, themeable via `--occult-*` custom properties) so it
  drops into any React app regardless of what styling system that app
  already uses. Using Tailwind/shadcn in *your own* app around these
  components is completely fine — that's a separate, compatible choice.
- **Every component is a thin wrapper**: `useOccultQuery` (one fetch hook,
  shared) → `StatusView` (loading/error/success) → a primitive
  (`DataTable`/`Stat`/`Card`). Adding component #13 means writing that
  wrapper, not new plumbing.
- **`display()`/`atPath()` in `lib/format.ts`** fix a real bug found while
  building this: the naive version checked `Array.isArray` before stripping
  snake_case, so an array like `["Throat", "Solar_plexus"]` kept its
  underscore. Every array element now goes through the same stripping as a
  lone string.
- **No diagram-rendering API.** A bodygraph, a chart wheel, anything visual —
  the API returns the numbers (gate positions, planet degrees), the
  component computes x/y with plain trigonometry client-side. This is the
  same approach already proven for the Human Design bodygraph built for
  panchang-web.

## Development

```bash
npm install
npm run build      # tsup -> dist/, plus dist/styles.css
npm run typecheck

cd demo
npm install        # links occult-api-ui via file:..
npm run dev         # http://localhost:5173
```

The demo app is the fastest way to see a change: it imports the built
`dist/`, so run `npm run build` in the root after editing a component, then
refresh the demo.
