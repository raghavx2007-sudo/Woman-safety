// ═══════════════════════════════════════════════════════════════
//  SafeSphere AI+ — Emergency Recording System (ERS)
//  recorder.js — loaded on every page via buildSharedUI
// ═══════════════════════════════════════════════════════════════

const ERS = (() => {

  // ── Internal state ───────────────────────────────────────────
  let _stream       = null;   // MediaStream
  let _recorder     = null;   // MediaRecorder
  let _chunks       = [];     // recorded blobs
  let _isRecording  = false;
  let _startTime    = null;
  let _timerInterval = null;
  let _location     = null;   // { lat, lng, accuracy }

  const REC_KEY = 'ss_recordings';

  // ── Storage helpers ──────────────────────────────────────────
  function getRecordings() {
    try { return JSON.parse(localStorage.getItem(REC_KEY) || '[]'); } catch { return []; }
  }
  function saveRecording(entry) {
    const list = getRecordings();
    list.unshift(entry);
    if (list.length > 20) list.pop();
    localStorage.setItem(REC_KEY, JSON.stringify(list));
  }
  function clearRecordings() { localStorage.removeItem(REC_KEY); }

  // ── Geolocation ──────────────────────────────────────────────
  function fetchLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => {
        _location = {
          lat: pos.coords.latitude.toFixed(5),
          lng: pos.coords.longitude.toFixed(5),
          accuracy: Math.round(pos.coords.accuracy)
        };
      },
      () => { _location = { lat: '11.01680', lng: '76.95580', accuracy: 50, simulated: true }; }
    );
  }

  // ── UI helpers ───────────────────────────────────────────────
  function setIndicator(active, elapsed) {
    const widget = document.getElementById('ersWidget');
    const dot    = document.getElementById('ersDot');
    const label  = document.getElementById('ersLabel');
    const timer  = document.getElementById('ersTimer');
    if (!widget) return;
    if (active) {
      widget.classList.add('active');
      if (dot)   dot.classList.add('recording');
      if (label) label.textContent = '● Recording (Stealth Mode)';
      if (timer) timer.textContent = elapsed || '00:00';
    } else {
      widget.classList.remove('active');
      if (dot)   dot.classList.remove('recording');
      if (label) label.textContent = 'Recording System Ready';
      if (timer) timer.textContent = '';
    }
  }

  function startTimer() {
    _startTime = Date.now();
    _timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - _startTime) / 1000);
      const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const s = String(elapsed % 60).padStart(2, '0');
      const el = document.getElementById('ersTimer');
      if (el) el.textContent = m + ':' + s;
    }, 1000);
  }

  function stopTimer() {
    clearInterval(_timerInterval);
    _timerInterval = null;
  }

  // ── Core: startRecording ─────────────────────────────────────
  async function startRecording(trigger = 'manual') {
    if (_isRecording) return;   // already running

    fetchLocation();

    // Request camera + mic
    try {
      _stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err) {
      // Fallback: audio only
      try {
        _stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
      } catch {
        SS.notify('🎥 Camera/mic permission denied. Recording skipped.', 'high');
        SS.logEvent('Recording failed — permission denied', 'high');
        return;
      }
    }

    // Attach stream to preview video
    const vid = document.getElementById('recordingVideo');
    if (vid) { vid.srcObject = _stream; vid.play().catch(() => {}); }

    // Show preview widget
    const preview = document.getElementById('recordingPreview');
    if (preview) preview.classList.add('show');

    // Start MediaRecorder
    _chunks = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : '';

    _recorder = new MediaRecorder(_stream, mimeType ? { mimeType } : {});
    _recorder.ondataavailable = e => { if (e.data && e.data.size > 0) _chunks.push(e.data); };
    _recorder.onstop = _onRecorderStop;
    _recorder.start(1000); // collect chunks every 1s

    _isRecording = true;
    startTimer();
    setIndicator(true);

    SS.logEvent(`Recording started automatically — trigger: ${trigger}`, 'high');
    SS.notify('🎥 Recording started (Stealth Mode)', 'high');

    // Auto-send alert after 1.5s (let location resolve)
    setTimeout(() => sendEmergencyAlert(trigger), 1500);
  }

  // ── Core: stopRecording ──────────────────────────────────────
  function stopRecording() {
    if (!_isRecording) return;
    if (_recorder && _recorder.state !== 'inactive') _recorder.stop();
    if (_stream) { _stream.getTracks().forEach(t => t.stop()); _stream = null; }
    _isRecording = false;
    stopTimer();
    setIndicator(false);

    const preview = document.getElementById('recordingPreview');
    if (preview) preview.classList.remove('show');

    SS.logEvent('Recording stopped — evidence saved', 'high');
    SS.notify('■ Recording stopped. Evidence saved.', 'med');
  }

  function _onRecorderStop() {
    if (!_chunks.length) return;
    const blob = new Blob(_chunks, { type: 'video/webm' });
    const url  = URL.createObjectURL(blob);
    const ts   = new Date().toISOString();
    const loc  = _location
      ? `${_location.lat}, ${_location.lng}${_location.simulated ? ' (simulated)' : ''}`
      : 'Unavailable';

    saveRecording({
      ts, url,
      filename: `evidence_${Date.now()}.webm`,
      location: loc,
      duration: _startTime ? Math.floor((Date.now() - _startTime) / 1000) : 0,
      threatScore: SS.getScore(),
      threatLevel: SS.getLevel(SS.getScore())
    });

    _chunks = [];
  }

  // ── Core: sendEmergencyAlert ─────────────────────────────────
  function sendEmergencyAlert(trigger = 'manual') {
    const settings = SS.getSettings();
    const contact  = settings.contactName  || 'Emergency Contact';
    const phone    = settings.contactPhone || 'Not set';
    const email    = settings.contactEmail || 'Not set';
    const loc      = _location
      ? `Lat: ${_location.lat}, Lng: ${_location.lng}`
      : 'Location unavailable';
    const level    = SS.getLevel(SS.getScore());
    const ts       = new Date().toLocaleString();

    // Simulate multi-step sending sequence
    const steps = [
      { delay: 0,    msg: '📤 Sending data to emergency contact...', type: 'high' },
      { delay: 1200, msg: `📍 Location shared: ${loc}`, type: 'med' },
      { delay: 2600, msg: `🎥 Recording file attached (evidence_${Date.now()}.webm)`, type: 'med' },
      { delay: 4000, msg: `📡 Alert sent to ${contact} — ${phone}`, type: 'low' },
    ];

    steps.forEach(s => setTimeout(() => SS.notify(s.msg, s.type), s.delay));

    // Log the full alert
    SS.logEvent(`Emergency alert sent to ${contact} (${phone}) — trigger: ${trigger}`, 'high');
    SS.logEvent(`Location shared: ${loc}`, 'high');
    SS.logEvent(`Message: "User may be in danger. Live location and recording attached."`, 'high');

    // Persist alert record
    const alerts = getAlerts();
    alerts.unshift({
      ts, trigger, contact, phone, email, loc,
      level, message: 'User may be in danger. Live location and recording attached.'
    });
    if (alerts.length > 50) alerts.pop();
    localStorage.setItem('ss_alerts', JSON.stringify(alerts));
  }

  function getAlerts() {
    try { return JSON.parse(localStorage.getItem('ss_alerts') || '[]'); } catch { return []; }
  }

  // ── Public API ───────────────────────────────────────────────
  return {
    startRecording,
    stopRecording,
    sendEmergencyAlert,
    getRecordings,
    clearRecordings,
    getAlerts,
    isRecording: () => _isRecording,
    getLocation: () => _location
  };

})();
