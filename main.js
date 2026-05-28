// ─── Utilities ────────────────────────────────────────────────────────────────

function autoFormatTime(input) {
  const raw = input.value.replace(/\D/g, '');
  if (raw.length === 0) return;
  if (raw.length <= 2) { input.value = `${raw}:00`; return; }
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

function parseTime(str) {
  if (!str?.trim()) return null;
  const parts = str.trim().split(':').map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1 && parts[0] >= 0) return parts[0];
  return null;
}

function fmtMMSS(totalSecs) {
  if (totalSecs == null || totalSecs < 0) return '';
  const s = Math.round(totalSecs);
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
}

function fmtHHMMSS(totalSecs) {
  if (totalSecs == null || totalSecs < 0) return '—';
  const s = Math.round(totalSecs);
  return `${Math.floor(s / 3600)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

function pad(n) { return String(n).padStart(2, '0'); }

function swimBaseUnits(dist, unit) {
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

function track(name, params) {
  if (typeof gtag === 'function') gtag('event', name, params);
}

// ─── Shared reset dialog ──────────────────────────────────────────────────────

let _pendingReset = null;

function openResetDialog(cb) {
  _pendingReset = cb;
  document.getElementById('reset-dialog').classList.add('open');
}

function closeResetDialog() {
  document.getElementById('reset-dialog').classList.remove('open');
}

document.getElementById('reset-cancel').addEventListener('click', closeResetDialog);
document.getElementById('reset-confirm').addEventListener('click', () => {
  closeResetDialog();
  if (_pendingReset) { _pendingReset(); _pendingReset = null; }
});
document.getElementById('reset-dialog').addEventListener('click', e => {
  if (e.target === document.getElementById('reset-dialog')) closeResetDialog();
});

// ─── Presets ─────────────────────────────────────────────────────────────────

const PRESETS = {
  sprint:  { swimDist: 750,  swimUnit: 'm',  bikeDist: 20,  bikeUnit: 'km', runDist: 5,    runUnit: 'km' },
  olympic: { swimDist: 1500, swimUnit: 'm',  bikeDist: 40,  bikeUnit: 'km', runDist: 10,   runUnit: 'km' },
  t100:    { swimDist: 2,    swimUnit: 'km', bikeDist: 80,  bikeUnit: 'km', runDist: 18,   runUnit: 'km' },
  '703':   { swimDist: 1.9,  swimUnit: 'km', bikeDist: 90,  bikeUnit: 'km', runDist: 21.1, runUnit: 'km' },
  ironman: { swimDist: 3.86, swimUnit: 'km', bikeDist: 180, bikeUnit: 'km', runDist: 42.2, runUnit: 'km' },
};

// ─── Scenario HTML template ───────────────────────────────────────────────────

function scenarioHTML(p, isMain) {
  return `
    <div class="scenario-cards">
      <section class="card">
        <div class="card-header">
          <span class="step">1</span>
          <h2>Race Distances</h2>
          <div class="presets">
            <button class="preset-btn" data-race="sprint">Sprint</button>
            <button class="preset-btn" data-race="olympic">Olympic</button>
            <button class="preset-btn" data-race="t100">T100</button>
            <button class="preset-btn" data-race="703">70.3</button>
            <button class="preset-btn" data-race="ironman">Ironman</button>
          </div>
        </div>
        <div class="card-body">
          <div class="dist-grid">
            <div class="dist-row">
              <div class="sport-label"><span class="sport-dot swim-dot"></span>🏊 Swim</div>
              <input type="number" id="${p}-swim-dist" placeholder="1500" min="0" step="any"/>
              <select id="${p}-swim-unit">
                <option value="m">meters</option>
                <option value="yd">yards</option>
                <option value="km">km</option>
                <option value="mi">miles</option>
              </select>
            </div>
            <div class="dist-row">
              <div class="sport-label"><span class="sport-dot bike-dot"></span>🚴 Bike</div>
              <input type="number" id="${p}-bike-dist" placeholder="40" min="0" step="any"/>
              <select id="${p}-bike-unit">
                <option value="km">km</option>
                <option value="mi">miles</option>
              </select>
            </div>
            <div class="dist-row">
              <div class="sport-label"><span class="sport-dot run-dot"></span>🏃 Run</div>
              <input type="number" id="${p}-run-dist" placeholder="10" min="0" step="any"/>
              <select id="${p}-run-unit">
                <option value="km">km</option>
                <option value="mi">miles</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="card-header">
          <span class="step">2</span>
          <h2>Target Pace &amp; Transitions</h2>
        </div>
        <div class="card-body">
          <div class="pace-grid">
            <div class="pace-row">
              <div class="sport-label"><span class="sport-dot swim-dot"></span>🏊 Swim</div>
              <div class="pace-input-wrap">
                <input type="text" id="${p}-swim-pace" placeholder="1:45" maxlength="6" inputmode="numeric"/>
                <span class="pace-unit-badge" id="${p}-swim-pace-label">/ 100m</span>
              </div>
              <span class="arrow-sep">⇄</span>
              <input type="text" id="${p}-swim-time" placeholder="0:26:15" maxlength="8" inputmode="numeric"/>
            </div>
            <div class="pace-row">
              <div class="sport-label"><span class="sport-dot bike-dot"></span>🚴 Bike</div>
              <div class="pace-input-wrap">
                <input type="number" id="${p}-bike-speed" placeholder="32.5" min="1" max="120" step="0.1"/>
                <span class="pace-unit-badge" id="${p}-bike-speed-label">km/h</span>
              </div>
              <span class="arrow-sep">⇄</span>
              <input type="text" id="${p}-bike-time" placeholder="1:13:50" maxlength="8" inputmode="numeric"/>
            </div>
            <div class="pace-row">
              <div class="sport-label"><span class="sport-dot run-dot"></span>🏃 Run</div>
              <div class="pace-input-wrap">
                <input type="text" id="${p}-run-pace" placeholder="5:30" maxlength="6" inputmode="numeric"/>
                <span class="pace-unit-badge" id="${p}-run-pace-label">/ km</span>
              </div>
              <span class="arrow-sep">⇄</span>
              <input type="text" id="${p}-run-time" placeholder="0:55:00" maxlength="8" inputmode="numeric"/>
            </div>
            <p class="field-hint">Enter pace <em>or</em> time — the other updates automatically.</p>
            <div class="pace-divider"></div>
            <div class="pace-row">
              <div class="transition-label"><span class="t-badge">T1</span>Transition 1</div>
              <input type="text" id="${p}-t1-time" placeholder="5:00" maxlength="5" inputmode="numeric"/>
            </div>
            <div class="pace-row">
              <div class="transition-label"><span class="t-badge">T2</span>Transition 2</div>
              <input type="text" id="${p}-t2-time" placeholder="3:00" maxlength="5" inputmode="numeric"/>
            </div>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="card-header">
          <span class="step">3</span>
          <h2>Race Summary</h2>
          <button class="share-btn reset-btn" id="${p}-reset-btn">&#8635; Reset</button>
          ${isMain ? `<button class="share-btn" id="${p}-share-btn">&#128279; Share</button>` : ''}
        </div>
        <div class="card-body">
          <div class="results-list">
            <div class="result-item">
              <div class="result-label"><span class="sport-dot swim-dot"></span>🏊 Swim</div>
              <div class="result-bar-track"><div class="result-bar swim-bar" id="${p}-swim-bar" style="width:0%"></div></div>
              <div class="result-time" id="${p}-result-swim">—</div>
              <div class="cumul-wrap no-data" id="${p}-cumul-swim-wrap">
                <span class="cumul-icon">⏱</span>
                <span class="cumul-tooltip" id="${p}-cumul-swim">—</span>
              </div>
            </div>
            <div class="result-item">
              <div class="result-label t-label"><span class="t-badge">T1</span>Transition</div>
              <div class="result-bar-track"><div class="result-bar t-bar" id="${p}-t1-bar" style="width:0%"></div></div>
              <div class="result-time muted" id="${p}-result-t1">—</div>
              <div class="cumul-wrap no-data" id="${p}-cumul-t1-wrap">
                <span class="cumul-icon">⏱</span>
                <span class="cumul-tooltip" id="${p}-cumul-t1">—</span>
              </div>
            </div>
            <div class="result-item">
              <div class="result-label"><span class="sport-dot bike-dot"></span>🚴 Bike</div>
              <div class="result-bar-track"><div class="result-bar bike-bar" id="${p}-bike-bar" style="width:0%"></div></div>
              <div class="result-time" id="${p}-result-bike">—</div>
              <div class="cumul-wrap no-data" id="${p}-cumul-bike-wrap">
                <span class="cumul-icon">⏱</span>
                <span class="cumul-tooltip" id="${p}-cumul-bike">—</span>
              </div>
            </div>
            <div class="result-item">
              <div class="result-label t-label"><span class="t-badge">T2</span>Transition</div>
              <div class="result-bar-track"><div class="result-bar t-bar" id="${p}-t2-bar" style="width:0%"></div></div>
              <div class="result-time muted" id="${p}-result-t2">—</div>
              <div class="cumul-wrap no-data" id="${p}-cumul-t2-wrap">
                <span class="cumul-icon">⏱</span>
                <span class="cumul-tooltip" id="${p}-cumul-t2">—</span>
              </div>
            </div>
            <div class="result-item">
              <div class="result-label"><span class="sport-dot run-dot"></span>🏃 Run</div>
              <div class="result-bar-track"><div class="result-bar run-bar" id="${p}-run-bar" style="width:0%"></div></div>
              <div class="result-time" id="${p}-result-run">—</div>
              <div class="cumul-wrap no-data" id="${p}-cumul-run-wrap">
                <span class="cumul-icon">⏱</span>
                <span class="cumul-tooltip" id="${p}-cumul-run">—</span>
              </div>
            </div>
          </div>
          <div class="total-row">
            <span class="total-label">Total Time</span>
            <span class="total-time" id="${p}-result-total">—</span>
          </div>
        </div>
      </section>
    </div>
  `;
}

// ─── Scenario factory ─────────────────────────────────────────────────────────

let _scenarioCount = 0;

function captureValues(p) {
  const $ = id => document.getElementById(`${p}-${id}`);
  return {
    swimDist:  $('swim-dist').value,
    swimUnit:  $('swim-unit').value,
    swimPace:  $('swim-pace').value,
    swimTime:  $('swim-time').value,
    bikeDist:  $('bike-dist').value,
    bikeUnit:  $('bike-unit').value,
    bikeSpeed: $('bike-speed').value,
    bikeTime:  $('bike-time').value,
    runDist:   $('run-dist').value,
    runUnit:   $('run-unit').value,
    runPace:   $('run-pace').value,
    runTime:   $('run-time').value,
    t1Time:    $('t1-time').value,
    t2Time:    $('t2-time').value,
  };
}

function createScenario({ isMain = false, initialValues = null } = {}) {
  const idx    = _scenarioCount++;
  const prefix = `s${idx}`;

  const wrapper = document.createElement('div');
  wrapper.className = 'scenario';
  wrapper.id = `scenario-${idx}`;
  wrapper.innerHTML = `
    <div class="scenario-header">
      <span class="scenario-label">Scenario ${idx + 1}</span>
      ${!isMain ? `<button class="scenario-remove-btn" aria-label="Remove scenario">✕ Remove</button>` : ''}
    </div>
    ${scenarioHTML(prefix, isMain)}
  `;

  document.getElementById('scenarios-container').appendChild(wrapper);

  if (!isMain) {
    wrapper.querySelector('.scenario-remove-btn').addEventListener('click', () => {
      wrapper.remove();
    });
  }

  initScenario(prefix, isMain, initialValues);
}

// ─── Scenario logic ───────────────────────────────────────────────────────────

function initScenario(p, isMain, initialValues = null) {
  const $  = id => document.getElementById(`${p}-${id}`);
  const el = $('reset-btn').closest('.scenario');

  const lastEdited = { swim: 'pace', bike: 'speed', run: 'pace' };
  let prevSwimUnit = 'm';
  let prevBikeUnit = 'km';
  let prevRunUnit  = 'km';

  // ── Pre-populate from duplicated scenario ──
  if (initialValues) {
    if (initialValues.swimDist)  $('swim-dist').value  = initialValues.swimDist;
    if (initialValues.swimUnit)  { $('swim-unit').value  = initialValues.swimUnit;  prevSwimUnit = initialValues.swimUnit; }
    if (initialValues.swimPace)  $('swim-pace').value  = initialValues.swimPace;
    if (initialValues.swimTime)  $('swim-time').value  = initialValues.swimTime;
    if (initialValues.bikeDist)  $('bike-dist').value  = initialValues.bikeDist;
    if (initialValues.bikeUnit)  { $('bike-unit').value  = initialValues.bikeUnit;  prevBikeUnit = initialValues.bikeUnit; }
    if (initialValues.bikeSpeed) $('bike-speed').value = initialValues.bikeSpeed;
    if (initialValues.bikeTime)  $('bike-time').value  = initialValues.bikeTime;
    if (initialValues.runDist)   $('run-dist').value   = initialValues.runDist;
    if (initialValues.runUnit)   { $('run-unit').value   = initialValues.runUnit;   prevRunUnit  = initialValues.runUnit; }
    if (initialValues.runPace)   $('run-pace').value   = initialValues.runPace;
    if (initialValues.runTime)   $('run-time').value   = initialValues.runTime;
    if (initialValues.t1Time)    $('t1-time').value    = initialValues.t1Time;
    if (initialValues.t2Time)    $('t2-time').value    = initialValues.t2Time;
  }

  // ── Load from URL (main scenario only) ──
  if (isMain) {
    const q = new URLSearchParams(location.search);
    if (q.has('swim-distance') || q.has('bike-distance') || q.has('run-distance')) {
      if (q.has('swim-distance')) $('swim-dist').value = q.get('swim-distance');
      if (q.has('swim-unit'))  { $('swim-unit').value = q.get('swim-unit'); prevSwimUnit = q.get('swim-unit'); }
      if (q.has('swim-input')) lastEdited.swim = q.get('swim-input');
      if (q.has('swim-pace'))  $('swim-pace').value = q.get('swim-pace');
      if (q.has('swim-time'))  $('swim-time').value = q.get('swim-time');

      if (q.has('bike-distance')) $('bike-dist').value = q.get('bike-distance');
      if (q.has('bike-unit'))  { $('bike-unit').value = q.get('bike-unit'); prevBikeUnit = q.get('bike-unit'); }
      if (q.has('bike-input')) lastEdited.bike = q.get('bike-input');
      if (q.has('bike-speed')) $('bike-speed').value = q.get('bike-speed');
      if (q.has('bike-time'))  $('bike-time').value  = q.get('bike-time');

      if (q.has('run-distance')) $('run-dist').value = q.get('run-distance');
      if (q.has('run-unit'))   { $('run-unit').value = q.get('run-unit'); prevRunUnit = q.get('run-unit'); }
      if (q.has('run-input'))  lastEdited.run = q.get('run-input');
      if (q.has('run-pace'))   $('run-pace').value = q.get('run-pace');
      if (q.has('run-time'))   $('run-time').value  = q.get('run-time');

      if (q.has('t1')) $('t1-time').value = q.get('t1');
      if (q.has('t2')) $('t2-time').value = q.get('t2');
    }
  }

  // ── Core update ──
  function update() {
    const swimUnit = $('swim-unit').value;
    const bikeUnit = $('bike-unit').value;
    const runUnit  = $('run-unit').value;

    $('swim-pace-label').textContent  = swimUnit === 'yd' ? '/ 100yd' : '/ 100m';
    $('bike-speed-label').textContent = bikeUnit === 'mi' ? 'mph' : 'km/h';
    $('run-pace-label').textContent   = runUnit  === 'mi' ? '/ mi'  : '/ km';

    // Swim
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

    // Bike
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

    // Run
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

    // Transitions
    const t1Secs = parseTime($('t1-time').value);
    const t2Secs = parseTime($('t2-time').value);

    // Results
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

    // Cumulative times
    const cumulSwim = swimSecs;
    const cumulT1   = (cumulSwim ?? 0) + (t1Secs   ?? 0) || null;
    const cumulBike = (cumulT1   ?? 0) + (bikeSecs  ?? 0) || null;
    const cumulT2   = (cumulBike ?? 0) + (t2Secs   ?? 0) || null;
    const cumulRun  = total;

    const setCumul = (wrapId, tipId, secs, label) => {
      const wrap = $(wrapId), tip = $(tipId);
      if (secs != null && secs > 0) {
        tip.textContent = label + fmtHHMMSS(secs);
        wrap.classList.remove('no-data');
      } else {
        tip.textContent = '—';
        wrap.classList.add('no-data');
      }
    };
    setCumul('cumul-swim-wrap', 'cumul-swim', cumulSwim, 'After swim: ');
    setCumul('cumul-t1-wrap',   'cumul-t1',   cumulT1,   'After T1: ');
    setCumul('cumul-bike-wrap', 'cumul-bike', cumulBike, 'After bike: ');
    setCumul('cumul-t2-wrap',   'cumul-t2',   cumulT2,   'After T2: ');
    setCumul('cumul-run-wrap',  'cumul-run',  cumulRun,  'Finish: ');

    if (isMain) syncToUrl();
  }

  // ── URL sync (main only) ──
  function syncToUrl() {
    const params = new URLSearchParams();
    const set = (k, v) => { if (v) params.set(k, v); };

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

  // ── Unit-change converters ──
  $('swim-unit').addEventListener('change', () => {
    const nu = $('swim-unit').value;
    const pace = parseTime($('swim-pace').value);
    if (pace != null) {
      if (prevSwimUnit !== 'yd' && nu === 'yd') $('swim-pace').value = fmtMMSS(pace / 0.9144);
      if (prevSwimUnit === 'yd' && nu !== 'yd') $('swim-pace').value = fmtMMSS(pace * 0.9144);
    }
    prevSwimUnit = nu;
    update();
  });

  $('bike-unit').addEventListener('change', () => {
    const nu = $('bike-unit').value;
    const speed = parseFloat($('bike-speed').value);
    if (speed && !isNaN(speed)) {
      if (prevBikeUnit === 'km' && nu === 'mi') $('bike-speed').value = (speed * 0.621371).toFixed(1);
      if (prevBikeUnit === 'mi' && nu === 'km') $('bike-speed').value = (speed * 1.60934).toFixed(1);
    }
    prevBikeUnit = nu;
    update();
  });

  $('run-unit').addEventListener('change', () => {
    const nu = $('run-unit').value;
    const pace = parseTime($('run-pace').value);
    if (pace != null) {
      if (prevRunUnit === 'km' && nu === 'mi') $('run-pace').value = fmtMMSS(pace * 1.60934);
      if (prevRunUnit === 'mi' && nu === 'km') $('run-pace').value = fmtMMSS(pace / 1.60934);
    }
    prevRunUnit = nu;
    update();
  });

  // ── Input listeners ──
  const on = (id, ev, fn) => $(id).addEventListener(ev, fn);
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

  // Auto-format time on blur
  ['swim-time', 'bike-time', 'run-time', 't1-time', 't2-time', 'run-pace', 'swim-pace'].forEach(id => {
    $(id).addEventListener('blur', () => { autoFormatTime($(id)); update(); });
  });

  // ── Enter-key focus progression ──
  const ENTER_NEXT = {
    'swim-dist':  'bike-dist',
    'bike-dist':  'run-dist',
    'run-dist':   'swim-pace',
    'swim-pace':  'bike-speed',
    'swim-time':  'bike-time',
    'bike-speed': 'run-pace',
    'bike-time':  'run-time',
    'run-pace':   't1-time',
    'run-time':   't1-time',
    't1-time':    't2-time',
  };
  Object.entries(ENTER_NEXT).forEach(([id, nextId]) => {
    $(id).addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      $(nextId).focus();
    });
  });
  $('t2-time').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); $('t2-time').blur(); }
  });

  // ── Preset buttons (scoped to this scenario) ──
  el.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = PRESETS[btn.dataset.race];
      if (!preset) return;
      el.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      track('preset_select', { race: btn.dataset.race });
      $('swim-dist').value = preset.swimDist;
      $('swim-unit').value = preset.swimUnit;
      $('bike-dist').value = preset.bikeDist;
      $('bike-unit').value = preset.bikeUnit;
      $('run-dist').value  = preset.runDist;
      $('run-unit').value  = preset.runUnit;
      prevSwimUnit = preset.swimUnit;
      prevBikeUnit = preset.bikeUnit;
      prevRunUnit  = preset.runUnit;
      update();
    });
  });

  // ── Reset ──
  function doReset() {
    ['swim-dist', 'swim-pace', 'swim-time',
     'bike-dist', 'bike-speed', 'bike-time',
     'run-dist',  'run-pace',  'run-time',
     't1-time',   't2-time'].forEach(id => { $(id).value = ''; });
    $('swim-unit').value = 'm';  prevSwimUnit = 'm';
    $('bike-unit').value = 'km'; prevBikeUnit = 'km';
    $('run-unit').value  = 'km'; prevRunUnit  = 'km';
    lastEdited.swim = 'pace';
    lastEdited.bike = 'speed';
    lastEdited.run  = 'pace';
    el.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    if (isMain) history.replaceState(null, '', location.pathname);
    track('reset_click');
    update();
  }
  $('reset-btn').addEventListener('click', () => openResetDialog(doReset));

  // ── Share (main scenario only) ──
  if (isMain) {
    $('share-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(location.href).then(() => {
        track('share_click');
        const btn = $('share-btn');
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = '&#128279; Share';
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  }

  // ── Analytics (main scenario only) ──
  if (isMain) {
    [
      ['swim-dist', 'swim_distance'], ['swim-unit', 'swim_unit'],
      ['swim-pace', 'swim_pace'],     ['swim-time', 'swim_time'],
      ['bike-dist', 'bike_distance'], ['bike-unit', 'bike_unit'],
      ['bike-speed','bike_speed'],    ['bike-time', 'bike_time'],
      ['run-dist',  'run_distance'],  ['run-unit',  'run_unit'],
      ['run-pace',  'run_pace'],      ['run-time',  'run_time'],
      ['t1-time',   't1'],            ['t2-time',   't2'],
    ].forEach(([id, field]) => {
      $(id).addEventListener('blur', () => {
        const val = $(id).value;
        if (val) track('input_change', { field, value: val });
      });
    });
  }

  update();
}

// ─── Init ─────────────────────────────────────────────────────────────────────

createScenario({ isMain: true });

document.getElementById('add-scenario-btn').addEventListener('click', () => {
  createScenario({ isMain: false });
  track('scenario_add');
});

document.getElementById('duplicate-scenario-btn').addEventListener('click', () => {
  const container = document.getElementById('scenarios-container');
  const lastScenario = container.lastElementChild;
  const lastPrefix = lastScenario.querySelector('[id$="-reset-btn"]').id.replace('-reset-btn', '');
  const values = captureValues(lastPrefix);
  createScenario({ isMain: false, initialValues: values });
  track('scenario_duplicate');
  container.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
