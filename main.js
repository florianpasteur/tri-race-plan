// ─── Utilities ────────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);

/**
 * On blur, reformat a raw digit string into H:MM:SS or M:SS.
 * e.g. "207" → "2:07", "503" → "5:03", "11520" → "1:15:20"
 * Digits are consumed right-to-left: last 2 = secs, next 2 = mins, rest = hours.
 */
function autoFormatTime(input) {
  const raw = input.value.replace(/\D/g, '');
  if (raw.length < 3) return;   // too short to be ambiguous — leave as-is

  const secs  = raw.slice(-2);
  const rest  = raw.slice(0, -2);
  const mins  = rest.slice(-2);
  const hours = rest.slice(0, -2);

  if (hours) {
    input.value = `${parseInt(hours, 10)}:${mins.padStart(2, '0')}:${secs.padStart(2, '0')}`;
  } else {
    input.value = `${parseInt(mins, 10)}:${secs.padStart(2, '0')}`;
  }
}

/** Parse "M:SS" or "H:MM:SS" string into total seconds, or null. */
function parseTime(str) {
  if (!str?.trim()) return null;
  const parts = str.trim().split(':').map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1 && parts[0] >= 0) return parts[0];
  return null;
}

/** Format seconds as "M:SS" */
function fmtMMSS(totalSecs) {
  if (totalSecs == null || totalSecs < 0) return '';
  const s = Math.round(totalSecs);
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
}

/** Format seconds as "H:MM:SS" */
function fmtHHMMSS(totalSecs) {
  if (totalSecs == null || totalSecs < 0) return '—';
  const s = Math.round(totalSecs);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}:${pad(m)}:${pad(s % 60)}`;
}

function pad(n) { return String(n).padStart(2, '0'); }

// ─── Distance helpers ─────────────────────────────────────────────────────────

function swimBaseUnits(dist, unit) {
  // Returns the number of 100-unit segments used for pace
  // For yd: 100yd segments; for m/km/mi: convert to m then 100m segments
  const d = parseFloat(dist);
  if (!d || d <= 0) return null;
  if (unit === 'yd') return d / 100;
  const meters = unit === 'm' ? d : unit === 'km' ? d * 1000 : d * 1609.344;
  return meters / 100;
}

function bikeTimeFromSpeed(dist, speed) {
  const d = parseFloat(dist), spd = parseFloat(speed);
  if (!d || d <= 0 || !spd || spd <= 0) return null;
  return (d / spd) * 3600;
}

function bikeSpeedFromTime(dist, timeSecs) {
  const d = parseFloat(dist);
  if (!d || d <= 0 || !timeSecs || timeSecs <= 0) return null;
  return d / (timeSecs / 3600);
}

// ─── State ────────────────────────────────────────────────────────────────────

// Which field was most recently edited per sport ('pace'/'speed' or 'time')
const lastEdited = { swim: 'pace', bike: 'speed', run: 'pace' };

// Track previous units to convert pace/speed values on unit change
let prevSwimUnit = 'm';
let prevBikeUnit = 'km';
let prevRunUnit  = 'km';

// ─── Core update ─────────────────────────────────────────────────────────────

function update() {
  const swimUnit  = $('swim-unit').value;
  const bikeUnit  = $('bike-unit').value;
  const runUnit   = $('run-unit').value;

  // Update unit labels
  $('swim-pace-label').textContent  = swimUnit === 'yd' ? '/ 100yd' : '/ 100m';
  $('bike-speed-label').textContent = bikeUnit === 'mi' ? 'mph' : 'km/h';
  $('run-pace-label').textContent   = runUnit  === 'mi' ? '/ mi'  : '/ km';

  // ── Swim ──
  const swimUnits = swimBaseUnits($('swim-dist').value, swimUnit);
  let swimSecs = null;

  if (lastEdited.swim === 'pace') {
    const pace = parseTime($('swim-pace').value);
    swimSecs = (swimUnits != null && pace != null) ? swimUnits * pace : null;
    if (document.activeElement !== $('swim-time'))
      $('swim-time').value = swimSecs != null ? fmtHHMMSS(swimSecs) : '';
  } else {
    swimSecs = parseTime($('swim-time').value);
    const pace = (swimUnits && swimSecs) ? swimSecs / swimUnits : null;
    if (document.activeElement !== $('swim-pace'))
      $('swim-pace').value = pace != null ? fmtMMSS(pace) : '';
  }

  // ── Bike ──
  let bikeSecs = null;

  if (lastEdited.bike === 'speed') {
    bikeSecs = bikeTimeFromSpeed($('bike-dist').value, $('bike-speed').value);
    if (document.activeElement !== $('bike-time'))
      $('bike-time').value = bikeSecs != null ? fmtHHMMSS(bikeSecs) : '';
  } else {
    bikeSecs = parseTime($('bike-time').value);
    const speed = bikeSpeedFromTime($('bike-dist').value, bikeSecs);
    if (document.activeElement !== $('bike-speed'))
      $('bike-speed').value = speed != null ? speed.toFixed(1) : '';
  }

  // ── Run ──
  const runDist = parseFloat($('run-dist').value);
  let runSecs = null;

  if (lastEdited.run === 'pace') {
    const pace = parseTime($('run-pace').value);
    runSecs = (runDist > 0 && pace != null) ? runDist * pace : null;
    if (document.activeElement !== $('run-time'))
      $('run-time').value = runSecs != null ? fmtHHMMSS(runSecs) : '';
  } else {
    runSecs = parseTime($('run-time').value);
    const pace = (runDist > 0 && runSecs) ? runSecs / runDist : null;
    if (document.activeElement !== $('run-pace'))
      $('run-pace').value = pace != null ? fmtMMSS(pace) : '';
  }

  // ── Transitions ──
  const t1Secs = parseTime($('t1-time').value);
  const t2Secs = parseTime($('t2-time').value);

  // ── Results ──
  const segments = [swimSecs, t1Secs, bikeSecs, t2Secs, runSecs];
  const hasAny   = segments.some(v => v != null);
  const total    = hasAny ? segments.reduce((a, b) => a + (b ?? 0), 0) : null;

  $('result-swim').textContent  = swimSecs != null ? fmtHHMMSS(swimSecs) : '—';
  $('result-t1').textContent    = t1Secs   != null ? fmtMMSS(t1Secs)     : '—';
  $('result-bike').textContent  = bikeSecs != null ? fmtHHMMSS(bikeSecs) : '—';
  $('result-t2').textContent    = t2Secs   != null ? fmtMMSS(t2Secs)     : '—';
  $('result-run').textContent   = runSecs  != null ? fmtHHMMSS(runSecs)  : '—';
  $('result-total').textContent = total    != null ? fmtHHMMSS(total)    : '—';

  // Progress bars
  const pct = v => total > 0 ? `${((v ?? 0) / total * 100).toFixed(1)}%` : '0%';
  $('swim-bar').style.width = pct(swimSecs);
  $('t1-bar').style.width   = pct(t1Secs);
  $('bike-bar').style.width = pct(bikeSecs);
  $('t2-bar').style.width   = pct(t2Secs);
  $('run-bar').style.width  = pct(runSecs);

  syncToUrl();
}

// ─── Unit-change converters ───────────────────────────────────────────────────

$('swim-unit').addEventListener('change', () => {
  const newUnit = $('swim-unit').value;
  const pace    = parseTime($('swim-pace').value);

  if (pace != null) {
    const wasYd = prevSwimUnit === 'yd';
    const isYd  = newUnit === 'yd';
    if (!wasYd && isYd)  $('swim-pace').value = fmtMMSS(pace / 0.9144);  // 100m→100yd
    if (wasYd  && !isYd) $('swim-pace').value = fmtMMSS(pace * 0.9144);  // 100yd→100m
  }
  prevSwimUnit = newUnit;
  update();
});

$('bike-unit').addEventListener('change', () => {
  const newUnit = $('bike-unit').value;
  const speed   = parseFloat($('bike-speed').value);

  if (speed && !isNaN(speed)) {
    if (prevBikeUnit === 'km' && newUnit === 'mi') $('bike-speed').value = (speed * 0.621371).toFixed(1);
    if (prevBikeUnit === 'mi' && newUnit === 'km') $('bike-speed').value = (speed * 1.60934).toFixed(1);
  }
  prevBikeUnit = newUnit;
  update();
});

$('run-unit').addEventListener('change', () => {
  const newUnit = $('run-unit').value;
  const pace    = parseTime($('run-pace').value);

  if (pace != null) {
    if (prevRunUnit === 'km' && newUnit === 'mi') $('run-pace').value = fmtMMSS(pace * 1.60934);
    if (prevRunUnit === 'mi' && newUnit === 'km') $('run-pace').value = fmtMMSS(pace / 1.60934);
  }
  prevRunUnit = newUnit;
  update();
});

// ─── Event listeners ─────────────────────────────────────────────────────────

function on(id, evt, fn) { $(id).addEventListener(evt, fn); }

on('swim-pace',  'input', () => { lastEdited.swim = 'pace';  update(); });
on('swim-time',  'input', () => { lastEdited.swim = 'time';  update(); });
on('swim-dist',  'input', update);

on('bike-speed', 'input', () => { lastEdited.bike = 'speed'; update(); });
on('bike-time',  'input', () => { lastEdited.bike = 'time';  update(); });
on('bike-dist',  'input', update);

on('run-pace',   'input', () => { lastEdited.run  = 'pace';  update(); });
on('run-time',   'input', () => { lastEdited.run  = 'time';  update(); });
on('run-dist',   'input', update);

on('t1-time', 'input', update);
on('t2-time', 'input', update);

// Auto-format bare digit sequences on blur for all time-based fields
['swim-time', 'bike-time', 'run-time', 't1-time', 't2-time', 'run-pace', 'swim-pace'].forEach(id => {
  $(id).addEventListener('blur', () => { autoFormatTime($(id)); update(); });
});

// ─── Preset race distances ────────────────────────────────────────────────────

const PRESETS = {
  sprint:  { swimDist: 750,  swimUnit: 'm',  bikeDist: 20,  bikeUnit: 'km', runDist: 5,    runUnit: 'km' },
  olympic: { swimDist: 1500, swimUnit: 'm',  bikeDist: 40,  bikeUnit: 'km', runDist: 10,   runUnit: 'km' },
  t100:    { swimDist: 2,    swimUnit: 'km', bikeDist: 80,  bikeUnit: 'km', runDist: 18,   runUnit: 'km' },
  '703':   { swimDist: 1.9,  swimUnit: 'km', bikeDist: 90,  bikeUnit: 'km', runDist: 21.1, runUnit: 'km' },
  ironman: { swimDist: 3.86, swimUnit: 'km', bikeDist: 180, bikeUnit: 'km', runDist: 42.2, runUnit: 'km' },
};

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const p = PRESETS[btn.dataset.race];
    if (!p) return;

    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    track('preset_select', { race: btn.dataset.race });

    $('swim-dist').value = p.swimDist;
    $('swim-unit').value = p.swimUnit;
    $('bike-dist').value = p.bikeDist;
    $('bike-unit').value = p.bikeUnit;
    $('run-dist').value  = p.runDist;
    $('run-unit').value  = p.runUnit;

    prevSwimUnit = p.swimUnit;
    prevBikeUnit = p.bikeUnit;
    prevRunUnit  = p.runUnit;

    update();
  });
});

// ─── URL sync ─────────────────────────────────────────────────────────────────

function syncToUrl() {
  const params = new URLSearchParams();
  const set = (key, val) => { if (val) params.set(key, val); };

  set('swim-distance', $('swim-dist').value);
  params.set('swim-unit', $('swim-unit').value);
  params.set('swim-input', lastEdited.swim);
  if (lastEdited.swim === 'pace') set('swim-pace', $('swim-pace').value);
  else                             set('swim-time', $('swim-time').value);

  set('bike-distance', $('bike-dist').value);
  params.set('bike-unit', $('bike-unit').value);
  params.set('bike-input', lastEdited.bike);
  if (lastEdited.bike === 'speed') set('bike-speed', $('bike-speed').value);
  else                              set('bike-time', $('bike-time').value);

  set('run-distance', $('run-dist').value);
  params.set('run-unit', $('run-unit').value);
  params.set('run-input', lastEdited.run);
  if (lastEdited.run === 'pace') set('run-pace', $('run-pace').value);
  else                            set('run-time', $('run-time').value);

  set('t1', $('t1-time').value);
  set('t2', $('t2-time').value);

  history.replaceState(null, '', '?' + params.toString());
}

function loadFromUrl() {
  const p = new URLSearchParams(location.search);
  if (!p.has('swim-distance') && !p.has('bike-distance') && !p.has('run-distance')) return;

  if (p.has('swim-distance')) $('swim-dist').value = p.get('swim-distance');
  if (p.has('swim-unit'))     $('swim-unit').value = p.get('swim-unit');
  if (p.has('swim-input')) {
    lastEdited.swim = p.get('swim-input');
    if (p.has('swim-pace')) $('swim-pace').value = p.get('swim-pace');
    if (p.has('swim-time')) $('swim-time').value = p.get('swim-time');
  }
  prevSwimUnit = $('swim-unit').value;

  if (p.has('bike-distance')) $('bike-dist').value = p.get('bike-distance');
  if (p.has('bike-unit'))     $('bike-unit').value = p.get('bike-unit');
  if (p.has('bike-input')) {
    lastEdited.bike = p.get('bike-input');
    if (p.has('bike-speed')) $('bike-speed').value = p.get('bike-speed');
    if (p.has('bike-time'))  $('bike-time').value  = p.get('bike-time');
  }
  prevBikeUnit = $('bike-unit').value;

  if (p.has('run-distance')) $('run-dist').value = p.get('run-distance');
  if (p.has('run-unit'))     $('run-unit').value = p.get('run-unit');
  if (p.has('run-input')) {
    lastEdited.run = p.get('run-input');
    if (p.has('run-pace')) $('run-pace').value = p.get('run-pace');
    if (p.has('run-time')) $('run-time').value = p.get('run-time');
  }
  prevRunUnit = $('run-unit').value;

  if (p.has('t1')) $('t1-time').value = p.get('t1');
  if (p.has('t2')) $('t2-time').value = p.get('t2');
}

// ─── Share button ─────────────────────────────────────────────────────────────

$('share-btn').addEventListener('click', () => {
  navigator.clipboard.writeText(location.href).then(() => {
    gtag('event', 'share_click');
    const btn = $('share-btn');
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Share';
      btn.classList.remove('copied');
    }, 2000);
  });
});

// ─── Analytics ────────────────────────────────────────────────────────────────

function track(eventName, params) {
  if (typeof gtag === 'function') gtag('event', eventName, params);
}

// Track inputs on blur (avoids firing on every keystroke)
[
  ['swim-dist',  'swim_distance'],
  ['swim-unit',  'swim_unit'],
  ['swim-pace',  'swim_pace'],
  ['swim-time',  'swim_time'],
  ['bike-dist',  'bike_distance'],
  ['bike-unit',  'bike_unit'],
  ['bike-speed', 'bike_speed'],
  ['bike-time',  'bike_time'],
  ['run-dist',   'run_distance'],
  ['run-unit',   'run_unit'],
  ['run-pace',   'run_pace'],
  ['run-time',   'run_time'],
  ['t1-time',    't1'],
  ['t2-time',    't2'],
].forEach(([id, field]) => {
  $(id).addEventListener('blur', () => {
    const val = $(id).value;
    if (val) track('input_change', { field, value: val });
  });
});

// ─── Init ─────────────────────────────────────────────────────────────────────
loadFromUrl();
update();
