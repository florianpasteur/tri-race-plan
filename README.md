# Tri Race Plan

A static triathlon race calculator hosted on GitHub Pages.

**Live site:** https://florianpasteur.github.io/tri-race-plan/

## Features

- **Race distance presets** — Sprint, Olympic, T100, 70.3, Ironman
- **Custom distances** — Swim (m / yd / km / mi), Bike (km / mi), Run (km / mi)
- **Two-way pace ↔ time** — enter either and the other is calculated automatically
- **Transition times** — T1 and T2 included in the total
- **Race summary** — proportional progress bars per segment and total finish time
- **Shareable URLs** — all inputs are encoded as query parameters; use the Share button to copy the link

## Development

```bash
npm install
npm start    # serves the site locally at http://localhost:3000
```

No build step — plain HTML, CSS, and JavaScript.

## URL parameters

A shared URL encodes the full calculator state:

| Parameter | Values | Description |
|---|---|---|
| `swim-distance` | number | Swim distance |
| `swim-unit` | `m` · `yd` · `km` · `mi` | Swim distance unit |
| `swim-input` | `pace` · `time` | Which field was entered |
| `swim-pace` | `M:SS` | Pace per 100m (or 100yd) |
| `swim-time` | `H:MM:SS` | Total swim time |
| `bike-distance` | number | Bike distance |
| `bike-unit` | `km` · `mi` | Bike distance unit |
| `bike-input` | `speed` · `time` | Which field was entered |
| `bike-speed` | number | Speed in km/h or mph |
| `bike-time` | `H:MM:SS` | Total bike time |
| `run-distance` | number | Run distance |
| `run-unit` | `km` · `mi` | Run distance unit |
| `run-input` | `pace` · `time` | Which field was entered |
| `run-pace` | `M:SS` | Pace per km or per mile |
| `run-time` | `H:MM:SS` | Total run time |
| `t1` | `M:SS` | Transition 1 time |
| `t2` | `M:SS` | Transition 2 time |
