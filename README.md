# Tri Race Calculator

A static single-page app that predicts your triathlon finish time from distances and target paces or segment times.

**Live site:** https://florianpasteur.github.io/tri-race-plan/

## Features

### Race distance presets
One click loads official distances for Sprint, Olympic, T100, 70.3, and Ironman. You can also type custom distances with your choice of unit — meters, yards, km, or miles for the swim; km or miles for bike and run.

### Two-way pace ↔ time
For each segment you can enter either the pace/speed *or* the total time — the other field updates automatically. Changing the distance recalculates both. Switch units and values are converted in place.

- **Swim** — pace in `M:SS` per 100 m (or 100 yd) ↔ total time
- **Bike** — speed in km/h (or mph) ↔ total time
- **Run** — pace in `M:SS` per km (or mile) ↔ total time

### Transition times
T1 (swim → bike) and T2 (bike → run) are included in the total finish time.

### Race summary
A live results panel shows each segment's time, a proportional progress bar, and the total finish time. Bars animate as you type.

Each segment also has a cumulative clock icon (⏱). Hover it to see the running total elapsed time at the end of that segment — useful to know your time at the mount/dismount line or at the run start.

### Time input shortcuts
You never have to type colons. When you leave a time field, bare digit sequences are automatically formatted:

| You type | Becomes |
|---|---|
| `5` | `5:00` |
| `45` | `45:00` |
| `145` | `1:45` |
| `327` | `3:27` |
| `11520` | `1:15:20` |

The rule is: last two digits = seconds, next two = minutes, any remainder = hours.

### Enter-key navigation
Press **Enter** in any field to jump to the next logical input. The cursor follows the column you are working in — so if you are filling in paces you stay in the pace column, and if you are filling in total times you stay in the time column:

```
swim dist → bike dist → run dist
    ↓                       ↓
swim pace → bike speed → run pace → T1 → T2
swim time → bike time  → run time ↗
```

### Shareable URLs
Every change is reflected in the URL query string via `history.replaceState`. Hit **Share** to copy the current URL to the clipboard. Anyone opening the link sees the same distances, paces, and results.

### Reset with confirmation
The **Reset** button opens a confirmation dialog before clearing all inputs and restoring default units, so accidental clicks don't lose your work.

### New scenario

Create a new scenario withing the same page to compare plans

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
| `swim-pace` | `M:SS` | Pace per 100 m (or 100 yd) |
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
