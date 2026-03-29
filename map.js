// ═══════════════════════════════════════════════════════════════
//  SafeSphere AI+ — Smart Map (map.js)
//  Features: Geocoding, Route Safety Check, Safe Reroute,
//            Live GPS Tracking, Voice Recognition
// ═══════════════════════════════════════════════════════════════

// ── Build Page Shell ─────────────────────────────────────────────────────────
document.getElementById('app').innerHTML = buildSidebar() + `
<div class="main-content">
  ${buildTopbar('Smart Map')}
  <div class="page" id="pageContent"></div>
</div>` + buildSharedUI();

document.getElementById('pageContent').innerHTML = `
<div class="page-header">
  <h1>Smart Map</h1>
  <p>Route safety analysis, live tracking, and threat zone detection</p>
</div>

<!-- Main Map Card -->
<div class="card section">
  <div class="card-header">
    <span class="card-icon">🗺️</span>
    <h2>Live Threat Map</h2>
    <span class="badge badge-live">LIVE</span>
  </div>

  <!-- Predefined Location Selector -->
  <div class="predefined-panel">
    <div class="predefined-row">
      <div class="predefined-select-wrap">
        <label class="route-input-label">📍 Select Source</label>
        <div class="select-with-search">
          <input class="input-field predefined-search" id="srcSearch" type="text" placeholder="Search area..." autocomplete="off" oninput="filterDropdown('src')" onfocus="openDropdown('src')" />
          <div class="predefined-dropdown" id="srcDropdown">
            <div class="predefined-option" data-value="" onclick="selectLocation('src', null)">— Choose Source —</div>
          </div>
        </div>
      </div>
      <div class="predefined-swap-col">
        <button class="swap-btn" onclick="swapLocations()" title="Swap source and destination">⇄</button>
      </div>
      <div class="predefined-select-wrap">
        <label class="route-input-label">🏁 Select Destination</label>
        <div class="select-with-search">
          <input class="input-field predefined-search" id="dstSearch" type="text" placeholder="Search area..." autocomplete="off" oninput="filterDropdown('dst')" onfocus="openDropdown('dst')" />
          <div class="predefined-dropdown" id="dstDropdown">
            <div class="predefined-option" data-value="" onclick="selectLocation('dst', null)">— Choose Destination —</div>
          </div>
        </div>
      </div>
      <div class="predefined-actions-col">
        <button class="find-route-btn" id="findRouteBtn" onclick="findPredefinedRoute()">Show Route</button>
        <button class="map-action-btn use-location-btn" onclick="useCurrentLocation()"><span>◎</span> Use My Location</button>
      </div>
    </div>
  </div>

  <!-- Route Result Info -->
  <div class="route-result-bar" id="routeResultBar" style="display:none">
    <span class="route-result-path" id="routeResultPath"></span>
    <span class="route-result-safety" id="routeResultSafety"></span>
  </div>

  <!-- Route Input (manual geocode) -->
  <details class="manual-route-details">
    <summary class="manual-route-summary">🔍 Manual Search (type any location)</summary>
    <div class="route-panel">
      <div class="route-input-wrap suggestions-wrap">
        <label class="route-input-label">Source Location</label>
        <input class="route-input" id="srcInput" type="text" placeholder="e.g. Gandhipuram, Coimbatore" autocomplete="off"/>
        <div class="suggestions" id="srcSuggestions" style="display:none"></div>
      </div>
      <div class="route-input-wrap suggestions-wrap">
        <label class="route-input-label">Destination Location</label>
        <input class="route-input" id="dstInput" type="text" placeholder="e.g. RS Puram, Coimbatore" autocomplete="off"/>
        <div class="suggestions" id="dstSuggestions" style="display:none"></div>
      </div>
      <button class="find-route-btn" id="findRouteBtn2" onclick="findSafeRoute()">Find Safe Route</button>
    </div>
  </details>

  <!-- Route Status -->
  <div class="route-status-bar" id="routeStatusBar">
    <span class="route-status-icon">◎</span>
    <span class="route-status-text">Enter source and destination to analyse route safety</span>
  </div>

  <!-- Map Action Buttons -->
  <div class="map-actions">
    <button class="map-action-btn" id="trackBtn" onclick="toggleLiveTracking()">
      <span>📡</span> Start Live Tracking
    </button>
    <button class="map-action-btn" onclick="addDynamicRiskZone()">
      <span>⚠️</span> Add Risk Zone
    </button>
    <button class="map-action-btn" onclick="clearAllRoutes()">
      <span>✕</span> Clear Routes
    </button>
    <button class="map-action-btn" onclick="centerOnUser()">
      <span>◎</span> My Location
    </button>
  </div>

  <!-- Map -->
  <div id="map"></div>

  <!-- Legend -->
  <div class="map-legend">
    <div class="legend-item"><div class="legend-dot" style="background:#4ade80"></div>Safe Zone</div>
    <div class="legend-item"><div class="legend-dot" style="background:#f87171"></div>Risk Zone</div>
    <div class="legend-item"><div class="legend-dot" style="background:#fff"></div>You</div>
    <div class="legend-item"><div class="legend-line" style="background:rgba(255,255,255,0.6)"></div>Safe Route</div>
    <div class="legend-item"><div class="legend-line" style="background:#f87171;opacity:0.7"></div>Unsafe Route</div>
    <div class="legend-item"><div class="legend-line" style="background:rgba(255,255,255,0.35);border-top:2px dashed rgba(255,255,255,0.35)"></div>Alt Route</div>
  </div>
</div>

<!-- Bottom Panels -->
<div class="grid-2 section">

  <!-- Route Info -->
  <div class="card">
    <div class="card-header"><span class="card-icon">🛣️</span><h2>Route Analysis</h2></div>
    <div id="routeInfo">
      <div class="info-row"><span class="info-key">Status</span><span class="info-val" id="riStatus">—</span></div>
      <div class="info-row"><span class="info-key">Risk Level</span><span class="info-val" id="riRisk">—</span></div>
      <div class="info-row"><span class="info-key">Risk Zones</span><span class="info-val" id="riZones">—</span></div>
      <div class="info-row"><span class="info-key">Distance</span><span class="info-val" id="riDist">—</span></div>
      <div class="info-row"><span class="info-key">Safe Route</span><span class="info-val" id="riSafe">—</span></div>
    </div>
  </div>

  <!-- Live Tracking -->
  <div class="card">
    <div class="card-header"><span class="card-icon">📡</span><h2>Live Tracking</h2></div>
    <div id="trackingInfo">
      <div class="info-row"><span class="info-key">Status</span><span class="info-val" id="trStatus">Inactive</span></div>
      <div class="info-row"><span class="info-key">In Risk Zone</span><span class="info-val" id="trZone">No</span></div>
      <div class="info-row"><span class="info-key">Threat Score</span><span class="info-val" id="trScore">—</span></div>
    </div>
    <div class="tracking-coords" id="trackingCoords" style="display:none">
      Lat: <span id="trLat">—</span> &nbsp; Lng: <span id="trLng">—</span><br>
      Accuracy: <span id="trAcc">—</span>m
    </div>
  </div>
</div>

<!-- Voice + Zone Info -->
<div class="grid-2">
  <div class="card">
    <div class="card-header"><span class="card-icon">🎤</span><h2>Voice Listening</h2></div>
    <p class="card-desc">Say "help", "emergency", or "save me" to trigger SOS.</p>
    <button class="voice-btn" id="voiceBtn" onclick="toggleVoice()">
      <div class="voice-indicator" id="voiceIndicator"></div>
      <span id="voiceBtnText">🎤 Start Voice Listening</span>
    </button>
    <div id="voiceTranscript" class="voice-transcript"></div>
  </div>

  <div class="card">
    <div class="card-header"><span class="card-icon">📍</span><h2>Zone Details</h2></div>
    <div id="zoneInfo" class="zone-info-text">Click any marker to view zone details.</div>
  </div>
</div>`;

// ═══════════════════════════════════════════════════════════════
//  PREDEFINED COIMBATORE LOCATIONS
// ═══════════════════════════════════════════════════════════════
const CBE_LOCATIONS = [
  { name: 'Gandhipuram',               lat: 11.0168, lng: 76.9558, risk: 'LOW'    },
  { name: 'RS Puram',                  lat: 11.0050, lng: 76.9600, risk: 'LOW'    },
  { name: 'Peelamedu',                 lat: 11.0270, lng: 77.0270, risk: 'MEDIUM' },
  { name: 'Singanallur',               lat: 11.0020, lng: 77.0200, risk: 'MEDIUM' },
  { name: 'Ukkadam',                   lat: 10.9900, lng: 76.9700, risk: 'HIGH'   },
  { name: 'Saibaba Colony',            lat: 11.0230, lng: 76.9480, risk: 'LOW'    },
  { name: 'Town Hall',                 lat: 11.0130, lng: 76.9680, risk: 'LOW'    },
  { name: 'Coimbatore Railway Station',lat: 11.0010, lng: 76.9680, risk: 'MEDIUM' },
  { name: 'Airport (CBE)',             lat: 11.0300, lng: 77.0430, risk: 'LOW'    },
  { name: 'Saravanampatti',            lat: 11.0750, lng: 77.0000, risk: 'LOW'    },
  { name: 'Vadavalli',                 lat: 11.0200, lng: 76.9100, risk: 'MEDIUM' },
  { name: 'Kuniyamuthur',              lat: 10.9750, lng: 76.9550, risk: 'HIGH'   },
];

// ═══════════════════════════════════════════════════════════════
//  MAP STATE
// ═══════════════════════════════════════════════════════════════
let map;
let routingControl  = null;   // primary route (LRM)
let safeRouteLayer  = null;   // alternative safe polyline
let trackPolyline   = null;   // live tracking path
let userMarker      = null;   // live GPS marker
let watchId         = null;   // geolocation watchPosition id
let trackPoints     = [];     // array of [lat,lng] for track path
let srcCoords       = null;   // geocoded source
let dstCoords       = null;   // geocoded destination
let srcMarker       = null;   // predefined source marker
let dstMarker       = null;   // predefined destination marker
let predefinedRoute = null;   // polyline for predefined route
let recognition     = null;
let voiceActive     = false;
let isTracking      = false;
let lastInRiskZone  = false;

const CENTER = [11.0168, 76.9558]; // Coimbatore

// ── Predefined Risk Zones ────────────────────────────────────────────────────
const RISK_ZONES = [
  { pos:[11.0050, 76.9400], radius:500, label:'Industrial Area' },
  { pos:[11.0220, 76.9800], radius:450, label:'East Outskirts' },
  { pos:[11.0090, 76.9650], radius:380, label:'Old Warehouse District' },
  { pos:[11.0310, 76.9350], radius:420, label:'Abandoned Zone' },
  { pos:[11.0140, 76.9900], radius:350, label:'Night Market Area' },
];

const SAFE_ZONES = [
  { pos:[11.0168, 76.9558], label:'City Center' },
  { pos:[11.0300, 76.9700], label:'North District' },
  { pos:[11.0380, 76.9480], label:'West Park' },
  { pos:[11.0450, 76.9600], label:'Central Hospital' },
];

// ═══════════════════════════════════════════════════════════════
//  MAP INIT
// ═══════════════════════════════════════════════════════════════
function initMap() {
  map = L.map('map', { zoomControl: true, attributionControl: false }).setView(CENTER, 13);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19, attribution: '© OpenStreetMap © CARTO'
  }).addTo(map);

  // Draw risk zones
  RISK_ZONES.forEach(z => {
    L.circle(z.pos, {
      radius: z.radius,
      color: '#be123c', fillColor: '#f43f5e',
      fillOpacity: 0.1, weight: 2,
      dashArray: '5,5'
    }).addTo(map).bindPopup(`<b style="color:#be123c">⚠ Risk Zone</b><br>${z.label}`);

    L.marker(z.pos, { icon: makeIcon('#f87171', 11) }).addTo(map)
      .on('click', () => showZoneInfo(z, 'risk'));
  });

  // Draw safe zones
  SAFE_ZONES.forEach(z => {
    L.marker(z.pos, { icon: makeIcon('#4ade80', 11) }).addTo(map)
      .on('click', () => showZoneInfo(z, 'safe'));
  });

  // User position marker (default center)
  userMarker = L.circleMarker(CENTER, {
    radius: 9, color: '#7c3aed', fillColor: '#9333ea',
    fillOpacity: 1, weight: 2.5
  }).addTo(map).bindPopup('<b>You are here</b>');
}

function makeIcon(color, size = 12) {
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color};border:2.5px solid rgba(255,255,255,0.9)"></div>`,
    iconSize: [size, size], iconAnchor: [size/2, size/2]
  });
}

function showZoneInfo(z, type) {
  const color = type === 'safe' ? 'var(--low)' : 'var(--high)';
  const label = type === 'safe' ? 'Safe Zone' : 'Risk Zone';
  document.getElementById('zoneInfo').innerHTML = `
    <div style="font-size:14px;font-weight:600;color:${color};margin-bottom:8px">${z.label}</div>
    <div class="info-row"><span class="info-key">Type</span><span class="info-val ${type === 'safe' ? 'safe' : 'unsafe'}">${label}</span></div>
    <div class="info-row"><span class="info-key">Lat / Lng</span><span class="info-val">${z.pos[0].toFixed(4)}, ${z.pos[1].toFixed(4)}</span></div>
    ${z.radius ? `<div class="info-row"><span class="info-key">Risk Radius</span><span class="info-val unsafe">${z.radius}m</span></div>` : ''}
    <div style="margin-top:8px;font-size:11px;color:var(--muted)">${type === 'safe' ? 'This area is considered safe for travel.' : 'Elevated risk detected. Avoid if possible.'}</div>`;
}

// ═══════════════════════════════════════════════════════════════
//  PREDEFINED LOCATION DROPDOWNS
// ═══════════════════════════════════════════════════════════════
let selectedSrc = null;
let selectedDst = null;

function buildDropdowns() {
  ['src', 'dst'].forEach(side => {
    const dropdown = document.getElementById(side + 'Dropdown');
    // Clear existing options except placeholder
    dropdown.innerHTML = `<div class="predefined-option" data-value="" onclick="selectLocation('${side}', null)">— Choose ${side === 'src' ? 'Source' : 'Destination'} —</div>`;
    CBE_LOCATIONS.forEach(loc => {
      const riskClass = loc.risk === 'HIGH' ? 'risk-high' : loc.risk === 'MEDIUM' ? 'risk-med' : 'risk-low';
      const div = document.createElement('div');
      div.className = 'predefined-option';
      div.dataset.name = loc.name.toLowerCase();
      div.innerHTML = `<span>${loc.name}</span><span class="predefined-risk ${riskClass}">${loc.risk}</span>`;
      div.onclick = () => selectLocation(side, loc);
      dropdown.appendChild(div);
    });
  });
}

function filterDropdown(side) {
  const query = document.getElementById(side + 'Search').value.toLowerCase();
  const dropdown = document.getElementById(side + 'Dropdown');
  dropdown.style.display = 'block';
  dropdown.querySelectorAll('.predefined-option[data-name]').forEach(opt => {
    opt.style.display = opt.dataset.name.includes(query) ? '' : 'none';
  });
}

function openDropdown(side) {
  document.getElementById(side + 'Dropdown').style.display = 'block';
}

function selectLocation(side, loc) {
  const searchEl = document.getElementById(side + 'Search');
  const dropdown = document.getElementById(side + 'Dropdown');
  if (side === 'src') selectedSrc = loc;
  else selectedDst = loc;
  searchEl.value = loc ? loc.name : '';
  dropdown.style.display = 'none';
}

// Close dropdowns on outside click
document.addEventListener('click', e => {
  ['src', 'dst'].forEach(side => {
    const search = document.getElementById(side + 'Search');
    const dropdown = document.getElementById(side + 'Dropdown');
    if (search && dropdown && !search.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
});

function swapLocations() {
  const tmp = selectedSrc;
  selectedSrc = selectedDst;
  selectedDst = tmp;
  document.getElementById('srcSearch').value = selectedSrc ? selectedSrc.name : '';
  document.getElementById('dstSearch').value = selectedDst ? selectedDst.name : '';
  if (selectedSrc && selectedDst) findPredefinedRoute();
}

function useCurrentLocation() {
  if (!navigator.geolocation) { SS.notify('Geolocation not supported.', 'high'); return; }
  SS.notify('Getting your location...', 'low');
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    selectedSrc = { name: 'My Location', lat, lng, risk: 'LOW' };
    document.getElementById('srcSearch').value = 'My Location';
    SS.notify('Current location set as source.', 'low');
  }, () => {
    // Fallback to Coimbatore center
    selectedSrc = { name: 'Gandhipuram (approx)', lat: CENTER[0], lng: CENTER[1], risk: 'LOW' };
    document.getElementById('srcSearch').value = selectedSrc.name;
    SS.notify('GPS unavailable. Using city center as source.', 'med');
  });
}

// ═══════════════════════════════════════════════════════════════
//  PREDEFINED ROUTE ENGINE
// ═══════════════════════════════════════════════════════════════
function getOverallRisk(src, dst) {
  const levels = { LOW: 0, MEDIUM: 1, HIGH: 2 };
  const max = Math.max(levels[src.risk] || 0, levels[dst.risk] || 0);
  return ['LOW', 'MEDIUM', 'HIGH'][max];
}

function clearPredefinedRoute() {
  if (srcMarker)       { map.removeLayer(srcMarker);       srcMarker       = null; }
  if (dstMarker)       { map.removeLayer(dstMarker);       dstMarker       = null; }
  if (predefinedRoute) { map.removeLayer(predefinedRoute); predefinedRoute = null; }
}

function findPredefinedRoute() {
  if (!selectedSrc || !selectedDst) {
    SS.notify('Please select both source and destination.', 'med');
    return;
  }
  if (selectedSrc.name === selectedDst.name) {
    SS.notify('Source and destination cannot be the same.', 'med');
    return;
  }

  clearPredefinedRoute();
  clearAllRoutes();

  const src = [selectedSrc.lat, selectedSrc.lng];
  const dst = [selectedDst.lat, selectedDst.lng];
  const risk = getOverallRisk(selectedSrc, selectedDst);
  const routeColor = risk === 'HIGH' ? '#be123c' : risk === 'MEDIUM' ? '#ec4899' : '#9333ea';
  const riskLabel  = risk === 'HIGH' ? '🔴 HIGH' : risk === 'MEDIUM' ? '🟡 MEDIUM' : '🟢 LOW';

  // Source marker
  srcMarker = L.marker(src, { icon: makeIcon('#9333ea', 14) }).addTo(map)
    .bindPopup(`<b>Source</b><br>${selectedSrc.name}<br><span style="color:${routeColor};font-weight:700">Risk: ${selectedSrc.risk}</span>`);

  // Destination marker
  dstMarker = L.marker(dst, { icon: makeIcon('#ec4899', 14) }).addTo(map)
    .bindPopup(`<b>Destination</b><br>${selectedDst.name}<br><span style="color:${routeColor};font-weight:700">Risk: ${selectedDst.risk}</span>`);

  // Draw polyline route
  const dashArray = risk === 'HIGH' ? '8,5' : null;
  predefinedRoute = L.polyline([src, dst], {
    color: routeColor, weight: 4, opacity: 0.85,
    dashArray, lineCap: 'round'
  }).addTo(map);

  // Fit map to both points
  map.fitBounds([src, dst], { padding: [70, 70], animate: true });

  // Show route result bar
  const bar = document.getElementById('routeResultBar');
  const safetyEl = document.getElementById('routeResultSafety');
  document.getElementById('routeResultPath').textContent = `${selectedSrc.name} → ${selectedDst.name}`;
  safetyEl.textContent = `Safety Level: ${risk}`;
  safetyEl.className = 'route-result-safety ' + (risk === 'HIGH' ? 'result-high' : risk === 'MEDIUM' ? 'result-med' : 'result-low');
  bar.style.display = 'flex';

  // Update route analysis panel
  const cls = risk === 'HIGH' ? 'unsafe' : risk === 'MEDIUM' ? 'warn' : 'safe';
  document.getElementById('riStatus').textContent = risk === 'HIGH' ? 'Unsafe' : risk === 'MEDIUM' ? 'Caution' : 'Safe';
  document.getElementById('riStatus').className   = 'info-val ' + cls;
  document.getElementById('riRisk').textContent   = risk;
  document.getElementById('riRisk').className     = 'info-val ' + cls;
  document.getElementById('riZones').textContent  = risk !== 'LOW' ? 'Area risk detected' : 'None';
  document.getElementById('riDist').textContent   = fmtDist(haversine(src, dst));
  document.getElementById('riSafe').textContent   = risk === 'LOW' ? 'N/A' : risk === 'MEDIUM' ? 'Proceed with care' : 'Avoid if possible';
  document.getElementById('riSafe').className     = 'info-val ' + cls;

  // Status bar
  const statusType = risk === 'HIGH' ? 'unsafe' : risk === 'MEDIUM' ? 'warn' : 'safe';
  const statusIcon = risk === 'HIGH' ? '⚠️' : risk === 'MEDIUM' ? '⚡' : '✅';
  setRouteStatus(statusType, statusIcon,
    `Route: ${selectedSrc.name} → ${selectedDst.name} — Safety: ${risk}`,
    'Risk: ' + risk);

  SS.logEvent(`Predefined route: ${selectedSrc.name} → ${selectedDst.name} | Risk: ${risk}`, risk.toLowerCase());
  SS.notify(`${statusIcon} Route set. Safety level: ${risk}`, risk.toLowerCase());
  SS.refreshTopbar();
}


let geocodeTimers = {};

function setupGeocodeInput(inputId, suggestId, coordVar) {
  const input = document.getElementById(inputId);
  const box   = document.getElementById(suggestId);

  input.addEventListener('input', () => {
    clearTimeout(geocodeTimers[inputId]);
    const q = input.value.trim();
    if (q.length < 3) { box.style.display = 'none'; return; }
    geocodeTimers[inputId] = setTimeout(() => fetchSuggestions(q, box, input, coordVar), 400);
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !box.contains(e.target)) box.style.display = 'none';
  });
}

async function fetchSuggestions(query, box, input, coordVar) {
  try {
    input.classList.add('geocoding');
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`;
    const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    input.classList.remove('geocoding');

    if (!data.length) { box.style.display = 'none'; return; }

    box.innerHTML = data.map((r, i) => `
      <div class="suggestion-item" data-idx="${i}" data-lat="${r.lat}" data-lng="${r.lon}" data-name="${r.display_name}">
        ${r.display_name}
      </div>`).join('');
    box.style.display = 'block';

    box.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const lat = parseFloat(item.dataset.lat);
        const lng = parseFloat(item.dataset.lng);
        input.value = item.dataset.name.split(',').slice(0,2).join(',').trim();
        box.style.display = 'none';
        if (coordVar === 'src') srcCoords = [lat, lng];
        else dstCoords = [lat, lng];
      });
    });
  } catch {
    input.classList.remove('geocoding');
  }
}

async function geocodeText(text) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=1&countrycodes=in`;
  const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  const data = await res.json();
  if (!data.length) return null;
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

// ═══════════════════════════════════════════════════════════════
//  ROUTE SAFETY ENGINE
// ═══════════════════════════════════════════════════════════════

// Haversine distance in metres between two [lat,lng] points
function haversine(a, b) {
  const R = 6371000;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLng = (b[1] - a[1]) * Math.PI / 180;
  const s = Math.sin(dLat/2)**2 + Math.cos(a[0]*Math.PI/180) * Math.cos(b[0]*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1-s));
}

// Check if a polyline (array of [lat,lng]) passes through any risk zone
// Returns { unsafe: bool, zones: string[], count: int }
function checkRouteSafety(latlngs) {
  const hitZones = new Set();
  for (const pt of latlngs) {
    for (const z of RISK_ZONES) {
      if (haversine(pt, z.pos) < z.radius + 80) hitZones.add(z.label);
    }
  }
  return { unsafe: hitZones.size > 0, zones: [...hitZones], count: hitZones.size };
}

// Compute a simple "safe" waypoint that nudges the route away from risk zones
function computeSafeWaypoint(src, dst) {
  // Midpoint shifted slightly north-west (away from most risk zones in dataset)
  const mid = [(src[0] + dst[0]) / 2 + 0.008, (src[1] + dst[1]) / 2 - 0.008];
  return mid;
}

// Rough distance string from metres
function fmtDist(m) {
  return m >= 1000 ? (m / 1000).toFixed(1) + ' km' : Math.round(m) + ' m';
}

function setRouteStatus(type, icon, text, badge) {
  const bar = document.getElementById('routeStatusBar');
  bar.className = 'route-status-bar ' + type;
  bar.innerHTML = `
    <span class="route-status-icon">${icon}</span>
    <span class="route-status-text">${text}</span>
    ${badge ? `<span class="route-risk-badge">${badge}</span>` : ''}`;
}

function updateRouteInfo(status, risk, zones, dist, safeAvail) {
  const cls = risk === 'HIGH' ? 'unsafe' : risk === 'MEDIUM' ? 'warn' : 'safe';
  document.getElementById('riStatus').textContent  = status;
  document.getElementById('riStatus').className    = 'info-val ' + cls;
  document.getElementById('riRisk').textContent    = risk;
  document.getElementById('riRisk').className      = 'info-val ' + cls;
  document.getElementById('riZones').textContent   = zones;
  document.getElementById('riDist').textContent    = dist;
  document.getElementById('riSafe').textContent    = safeAvail;
  document.getElementById('riSafe').className      = 'info-val ' + (safeAvail === 'Yes ✅' ? 'safe' : 'unsafe');
}

// ═══════════════════════════════════════════════════════════════
//  FIND SAFE ROUTE — Main Handler
// ═══════════════════════════════════════════════════════════════
async function findSafeRoute() {
  const srcText = document.getElementById('srcInput').value.trim();
  const dstText = document.getElementById('dstInput').value.trim();

  if (!srcText || !dstText) {
    SS.notify('Please enter both source and destination.', 'med');
    return;
  }

  const btn = document.getElementById('findRouteBtn2');
  btn.disabled = true;
  btn.textContent = 'Analysing...';
  setRouteStatus('warn', '⏳', 'Geocoding locations...', '');

  // Geocode if not already selected from suggestions
  if (!srcCoords) srcCoords = await geocodeText(srcText);
  if (!dstCoords) dstCoords = await geocodeText(dstText);

  if (!srcCoords || !dstCoords) {
    setRouteStatus('unsafe', '✕', 'Could not find one or both locations. Try more specific names.', '');
    btn.disabled = false; btn.textContent = 'Find Safe Route';
    SS.notify('Location not found. Try adding city name.', 'high');
    return;
  }

  clearAllRoutes();
  setRouteStatus('warn', '⏳', 'Calculating route...', '');

  // Place source / destination markers
  L.marker(srcCoords, { icon: makeIcon('#ffffff', 13) }).addTo(map)
    .bindPopup('<b>Source</b><br>' + srcText).openPopup();
  L.marker(dstCoords, { icon: makeIcon('#aaaaaa', 13) }).addTo(map)
    .bindPopup('<b>Destination</b><br>' + dstText);

  map.fitBounds([srcCoords, dstCoords], { padding: [60, 60] });

  // Draw primary route via LRM
  routingControl = L.Routing.control({
    waypoints: [L.latLng(...srcCoords), L.latLng(...dstCoords)],
    routeWhileDragging: false,
    addWaypoints: false,
    fitSelectedRoutes: false,
    show: false,
    lineOptions: {
      styles: [{ color: '#888', weight: 4, opacity: 0.7 }],
      extendToWaypoints: true,
      missingRouteTolerance: 0
    },
    createMarker: () => null,
  }).addTo(map);

  routingControl.on('routesfound', (e) => {
    const route     = e.routes[0];
    const coords    = route.coordinates.map(c => [c.lat, c.lng]);
    const totalDist = route.summary.totalDistance;
    const safety    = checkRouteSafety(coords);

    btn.disabled = false; btn.textContent = 'Find Safe Route';

    if (safety.unsafe) {
      // ── UNSAFE ROUTE ──────────────────────────────────────────
      const riskLevel = safety.count >= 3 ? 'HIGH' : safety.count >= 2 ? 'HIGH' : 'MEDIUM';

      setRouteStatus('unsafe', '⚠️',
        `Unsafe path detected — passes through ${safety.count} risk zone${safety.count > 1 ? 's' : ''}. Switching to safer route...`,
        'Risk: ' + riskLevel);

      updateRouteInfo('Unsafe', riskLevel, safety.zones.join(', ') || safety.count + ' zone(s)',
        fmtDist(totalDist), 'Yes ✅');

      SS.addScore(3);
      SS.logEvent(`Unsafe route detected — ${safety.count} risk zone(s): ${safety.zones.join(', ')}`, 'high');
      SS.notify('⚠️ Unsafe path detected! Safer route calculated.', 'high');
      SS.refreshTopbar();

      // Draw unsafe route in red-tinted grey
      routingControl.setWaypoints([]);
      L.polyline(coords, { color: '#be123c', weight: 4, opacity: 0.6, dashArray: '8,5' }).addTo(map);

      // ── DRAW SAFE ALTERNATIVE ─────────────────────────────────
      const waypoint = computeSafeWaypoint(srcCoords, dstCoords);
      const safeControl = L.Routing.control({
        waypoints: [L.latLng(...srcCoords), L.latLng(...waypoint), L.latLng(...dstCoords)],
        routeWhileDragging: false,
        addWaypoints: false,
        fitSelectedRoutes: false,
        show: false,
        lineOptions: {
          styles: [{ color: '#e0e0e0', weight: 4, opacity: 0.85 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0
        },
        createMarker: () => null,
      }).addTo(map);

      safeControl.on('routesfound', (ev) => {
        const safeCoords = ev.routes[0].coordinates.map(c => [c.lat, c.lng]);
        const safeDist   = ev.routes[0].summary.totalDistance;
        const safeCheck  = checkRouteSafety(safeCoords);

        safeControl.setWaypoints([]);
        safeRouteLayer = L.polyline(safeCoords, { color: '#9333ea', weight: 4, opacity: 0.85 }).addTo(map);

        const finalRisk = safeCheck.unsafe ? 'MEDIUM' : 'LOW';
        setRouteStatus('safe', '✅',
          `Safer Route Available — ${safeCheck.unsafe ? 'reduced risk' : 'avoids all risk zones'}`,
          'Risk: ' + finalRisk);

        updateRouteInfo('Safe Route Active', finalRisk,
          safeCheck.zones.length ? safeCheck.zones.join(', ') : 'None',
          fmtDist(safeDist), 'Yes ✅');

        SS.logEvent('Safe alternative route drawn — risk: ' + finalRisk, finalRisk.toLowerCase());
        SS.notify('✅ Safer Route Available — risk reduced to ' + finalRisk, 'low');
        SS.refreshTopbar();
      });

    } else {
      // ── SAFE ROUTE ────────────────────────────────────────────
      setRouteStatus('safe', '✅', 'Route is safe — no risk zones detected', 'Risk: LOW');
      updateRouteInfo('Safe', 'LOW', 'None', fmtDist(totalDist), 'N/A');
      SS.logEvent('Safe route found — no risk zones on path', 'low');
      SS.notify('✅ Route is safe. No risk zones detected.', 'low');
    }
  });

  routingControl.on('routingerror', () => {
    btn.disabled = false; btn.textContent = 'Find Safe Route';
    setRouteStatus('unsafe', '✕', 'Could not calculate route. Check location names.', '');
    SS.notify('Route calculation failed. Try different locations.', 'high');
  });
}

// ═══════════════════════════════════════════════════════════════
//  LIVE GPS TRACKING
// ═══════════════════════════════════════════════════════════════
function toggleLiveTracking() {
  if (isTracking) stopLiveTracking();
  else startLiveTracking();
}

function startLiveTracking() {
  if (!navigator.geolocation) {
    SS.notify('Geolocation not supported by this browser.', 'high');
    return;
  }

  trackPoints = [];
  isTracking  = true;
  lastInRiskZone = false;

  const btn = document.getElementById('trackBtn');
  btn.classList.add('tracking');
  btn.innerHTML = '<span>📡</span> Tracking Active';

  document.getElementById('trStatus').textContent  = 'Active';
  document.getElementById('trStatus').className    = 'info-val safe';
  document.getElementById('trackingCoords').style.display = 'block';

  SS.logEvent('Live GPS tracking started', 'low');
  SS.notify('📡 Live tracking active. Monitoring your position...', 'low');

  watchId = navigator.geolocation.watchPosition(
    onPositionUpdate,
    onPositionError,
    { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
  );
}

function stopLiveTracking() {
  if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
  isTracking = false;

  const btn = document.getElementById('trackBtn');
  btn.classList.remove('tracking');
  btn.innerHTML = '<span>📡</span> Start Live Tracking';

  document.getElementById('trStatus').textContent = 'Inactive';
  document.getElementById('trStatus').className   = 'info-val';
  document.getElementById('trackingCoords').style.display = 'none';

  SS.logEvent('Live GPS tracking stopped', 'low');
  SS.notify('Live tracking stopped.', '');
}

function onPositionUpdate(pos) {
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;
  const acc = Math.round(pos.coords.accuracy);

  // Update marker
  userMarker.setLatLng([lat, lng]);
  map.panTo([lat, lng], { animate: true, duration: 0.8 });

  // Append to track path
  trackPoints.push([lat, lng]);
  if (trackPolyline) map.removeLayer(trackPolyline);
  if (trackPoints.length > 1) {
    trackPolyline = L.polyline(trackPoints, { color: '#7c3aed', weight: 3, opacity: 0.65, dashArray: '5,5' }).addTo(map);
  }

  // Update UI
  document.getElementById('trLat').textContent = lat.toFixed(5);
  document.getElementById('trLng').textContent = lng.toFixed(5);
  document.getElementById('trAcc').textContent = acc;
  document.getElementById('trScore').textContent = SS.getScore() + ' / 10';

  // Check if inside any risk zone
  const inRisk = RISK_ZONES.find(z => haversine([lat, lng], z.pos) < z.radius);

  if (inRisk && !lastInRiskZone) {
    lastInRiskZone = true;
    SS.addScore(2);
    SS.setStealth(true);
    SS.logEvent(`Entered risk zone: ${inRisk.label}`, 'high');
    SS.notify(`⚠️ Entering Unsafe Area — ${inRisk.label}! Stealth activated.`, 'high');
    SS.refreshTopbar();
    document.getElementById('trZone').textContent = 'YES — ' + inRisk.label;
    document.getElementById('trZone').className   = 'info-val unsafe';
    document.getElementById('trScore').textContent = SS.getScore() + ' / 10';
    // Flash user marker red
    userMarker.setStyle({ color: '#be123c', fillColor: '#f43f5e' });
  } else if (!inRisk && lastInRiskZone) {
    lastInRiskZone = false;
    SS.logEvent('Exited risk zone — back to safe area', 'low');
    SS.notify('✅ Exited risk zone. You are in a safer area.', 'low');
    document.getElementById('trZone').textContent = 'No';
    document.getElementById('trZone').className   = 'info-val safe';
    userMarker.setStyle({ color: '#7c3aed', fillColor: '#9333ea' });
  }
}

function onPositionError(err) {
  SS.notify('GPS error: ' + err.message + '. Using simulated position.', 'med');
  simulateLiveTracking();
}

// Fallback: simulate movement around Coimbatore when GPS unavailable
function simulateLiveTracking() {
  let step = 0;
  const path = [
    [11.0168, 76.9558], [11.0180, 76.9570], [11.0160, 76.9590],
    [11.0140, 76.9610], [11.0100, 76.9630], [11.0090, 76.9650],
    [11.0080, 76.9660], [11.0070, 76.9670], [11.0060, 76.9650],
    [11.0050, 76.9400]  // enters risk zone
  ];

  const sim = setInterval(() => {
    if (!isTracking || step >= path.length) { clearInterval(sim); return; }
    onPositionUpdate({ coords: { latitude: path[step][0], longitude: path[step][1], accuracy: 15 } });
    step++;
  }, 1800);
}

function centerOnUser() {
  if (userMarker) map.setView(userMarker.getLatLng(), 15, { animate: true });
  else map.setView(CENTER, 13, { animate: true });
}

// ═══════════════════════════════════════════════════════════════
//  UTILITY ACTIONS
// ═══════════════════════════════════════════════════════════════
function clearAllRoutes() {
  if (routingControl) { try { map.removeControl(routingControl); } catch(e){} routingControl = null; }
  if (safeRouteLayer) { map.removeLayer(safeRouteLayer); safeRouteLayer = null; }
  clearPredefinedRoute();
  // Remove any stray polylines added for unsafe/safe routes
  map.eachLayer(l => {
    if (l instanceof L.Polyline && !(l instanceof L.CircleMarker) && l !== trackPolyline) {
      map.removeLayer(l);
    }
  });
  srcCoords = null; dstCoords = null;
  document.getElementById('routeResultBar').style.display = 'none';
  setRouteStatus('', '◎', 'Routes cleared. Enter new source and destination.', '');
  updateRouteInfo('—', '—', '—', '—', '—');
  SS.notify('Routes cleared.', '');
}

function addDynamicRiskZone() {
  const lat = CENTER[0] + (Math.random() - 0.5) * 0.025;
  const lng = CENTER[1] + (Math.random() - 0.5) * 0.025;
  const r   = 300 + Math.floor(Math.random() * 200);
  const newZone = { pos:[lat, lng], radius: r, label: 'Dynamic Risk Zone' };
  RISK_ZONES.push(newZone);

  L.circle([lat, lng], { radius: r, color: '#f87171', fillColor: '#f87171', fillOpacity: 0.08, weight: 1.5, dashArray: '4,4' })
    .addTo(map).bindPopup('<b style="color:#f87171">⚠ Risk Zone</b><br>Dynamic — newly detected');
  L.marker([lat, lng], { icon: makeIcon('#f87171', 11) }).addTo(map)
    .on('click', () => showZoneInfo(newZone, 'risk'));

  SS.addScore(2);
  SS.logEvent('New risk zone detected and added to map', 'med');
  SS.notify('⚠️ New risk zone detected nearby.', 'med');
  SS.refreshTopbar();
}

// ═══════════════════════════════════════════════════════════════
//  VOICE RECOGNITION
// ═══════════════════════════════════════════════════════════════
const TRIGGER_WORDS = ['help', 'emergency', 'save me', 'danger', 'sos', 'bachao'];

function toggleVoice() {
  if (voiceActive) { stopVoice(); return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { SS.notify('Speech recognition not supported in this browser.', 'high'); return; }

  recognition = new SR();
  recognition.continuous    = true;
  recognition.interimResults = true;
  recognition.lang          = 'en-US';

  recognition.onresult = (e) => {
    const transcript = Array.from(e.results).map(r => r[0].transcript).join(' ').toLowerCase();
    document.getElementById('voiceTranscript').textContent = '🎙 Heard: "' + transcript + '"';
    if (TRIGGER_WORDS.some(w => transcript.includes(w))) {
      stopVoice();
      SS.detectVoiceTrigger();
      SS.refreshTopbar();
    }
  };
  recognition.onerror = () => { stopVoice(); SS.notify('Voice recognition error.', 'high'); };
  recognition.onend   = () => { if (voiceActive) recognition.start(); };
  recognition.start();

  voiceActive = true;
  document.getElementById('voiceBtn').classList.add('listening');
  document.getElementById('voiceBtnText').textContent = '🔴 Listening... say "help" to trigger SOS';
  SS.logEvent('Voice listening started', 'low');
  SS.notify('🎤 Voice listening active. Say "help" to trigger SOS.', 'low');
}

function stopVoice() {
  if (recognition) { recognition.stop(); recognition = null; }
  voiceActive = false;
  document.getElementById('voiceBtn').classList.remove('listening');
  document.getElementById('voiceBtnText').textContent = '🎤 Start Voice Listening';
  document.getElementById('voiceTranscript').textContent = '';
}

// ═══════════════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════════════
SS.init();
initMap();
buildDropdowns();
setupGeocodeInput('srcInput', 'srcSuggestions', 'src');
setupGeocodeInput('dstInput', 'dstSuggestions', 'dst');
