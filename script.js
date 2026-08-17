/* =========================================================
   Buat Dinar — slide, audio, deteksi tiupan, confetti
   Vanilla, tanpa dependency. Referensi: DESIGN.md §5, §6, §8
   ========================================================= */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* =======================================================
     AUDIO — Web Audio API, disintesis manual. DESIGN.md §8
     ======================================================= */

  var AUDIO = (function () {
    var ctx = null;
    var bus = null;      // semua nada masuk sini
    var master = null;   // gerbang volume + mute
    var muted = false;

    // Preset instrumen — DESIGN.md §8.
    // Ganti CURRENT ke 'kalimba' kalau music box kerasa kemanisan.
    var INSTRUMENTS = {
      musicbox: {
        partials: [[1, 1.00], [2, 0.25], [3.01, 0.08]],
        attack: 0.005, decay: 1.4, cutoff: 4000
      },
      kalimba: {
        partials: [[1, 1.00], [2, 0.18], [4.7, 0.05]],
        attack: 0.008, decay: 0.9, cutoff: 2600
      }
    };
    var CURRENT = 'musicbox';

    // Wajib dipanggil dari dalam event handler user. Browser blokir kalau nggak.
    function ensure() {
      if (ctx) {
        if (ctx.state === 'suspended') ctx.resume();
        return;
      }
      var Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return;

      ctx = new Ctor();
      if (ctx.state === 'suspended') ctx.resume();   // iOS butuh ini

      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.15;          // ceiling 0.15 — DESIGN.md §8
      master.connect(ctx.destination);

      bus = ctx.createGain();
      bus.connect(master);

      // Kesan ruang murah: feedback delay pendek, bukan convolver
      var delay = ctx.createDelay(1);
      delay.delayTime.value = 0.12;
      var fb = ctx.createGain();
      fb.gain.value = 0.25;
      var wet = ctx.createGain();
      wet.gain.value = 0.35;

      bus.connect(delay);
      delay.connect(fb);
      fb.connect(delay);
      delay.connect(wet);
      wet.connect(master);
    }

    function note(freq, at, level) {
      if (!ctx) return;
      var p = INSTRUMENTS[CURRENT];
      var g = level == null ? 1 : level;

      var lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = p.cutoff;

      var env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, at);
      env.gain.exponentialRampToValueAtTime(0.9 * g, at + p.attack);
      env.gain.exponentialRampToValueAtTime(0.0001, at + p.decay);

      lp.connect(env);
      env.connect(bus);

      for (var i = 0; i < p.partials.length; i++) {
        var osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq * p.partials[i][0];

        var pg = ctx.createGain();
        pg.gain.value = p.partials[i][1];

        osc.connect(pg);
        pg.connect(lp);
        osc.start(at);
        osc.stop(at + p.decay + 0.05);
      }
    }

    /* Analyser buat mikrofon. Sengaja TIDAK disambung ke destination —
       kalau disambung, suara mikrofon keluar speaker dan bikin feedback. */
    function analyserFor(stream) {
      ensure();
      if (!ctx) return null;
      var source = ctx.createMediaStreamSource(stream);
      var analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);
      return { analyser: analyser, source: source, sampleRate: ctx.sampleRate };
    }

    function now() { return ctx ? ctx.currentTime : 0; }

    /* Mute cuma nurunin gain, TIDAK nge-suspend context.
       Kalau di-suspend, analyser mikrofon ikut mati — deteksi tiupan
       bakal rusak begitu orang mute musiknya. */
    function setMuted(next) {
      muted = next;
      if (!ctx) return;
      master.gain.setTargetAtTime(muted ? 0 : 0.15, ctx.currentTime, 0.02);
    }

    function isMuted() { return muted; }
    function suspend() { if (ctx && ctx.state === 'running') ctx.suspend(); }
    function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }

    return {
      ensure: ensure, note: note, now: now, analyserFor: analyserFor,
      setMuted: setMuted, isMuted: isMuted, suspend: suspend, resume: resume
    };
  })();

  /* ---------- Melodi: Happy Birthday to You (public domain) ----------
     C mayor, 100 BPM, rasa 3/4. Baris ketiga — baris yang bawa nama —
     naik ke G5, nada tertinggi lagu ini. */

  var N = {
    G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25,
    D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99
  };

  var MELODY = [
    [N.G4, 0.75], [N.G4, 0.25], [N.A4, 1], [N.G4, 1], [N.C5, 1], [N.B4, 2],
    [N.G4, 0.75], [N.G4, 0.25], [N.A4, 1], [N.G4, 1], [N.D5, 1], [N.C5, 2],
    [N.G4, 0.75], [N.G4, 0.25], [N.G5, 1], [N.E5, 1], [N.C5, 1], [N.B4, 1], [N.A4, 1],
    [N.F5, 0.75], [N.F5, 0.25], [N.E5, 1], [N.C5, 1], [N.D5, 1], [N.C5, 2]
  ];

  var BEAT = 0.6; // 100 BPM
  var melodyBusyUntil = 0;

  function melodyDuration() {
    var beats = 0;
    for (var i = 0; i < MELODY.length; i++) beats += MELODY[i][1];
    return beats * BEAT;
  }

  function playMelody() {
    AUDIO.ensure();
    var t = AUDIO.now() + 0.08;
    for (var i = 0; i < MELODY.length; i++) {
      AUDIO.note(MELODY[i][0], t, 1);
      t += MELODY[i][1] * BEAT;
    }
    melodyBusyUntil = Date.now() + melodyDuration() * 1000;
    return melodyDuration();
  }

  /* =======================================================
     CONFETTI — canvas manual, ada budget. DESIGN.md §5
     ======================================================= */

  var CONFETTI_COLORS = ['#FF4D8D', '#FFD6E5', '#FFC94D', '#A78BFA', '#FFFFFF'];

  function burstConfetti() {
    if (reduceMotion.matches) return;  // skip total, bukan dipercepat

    var canvas = document.createElement('canvas');
    canvas.className = 'confetti';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    var ctx2d = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);  // cap 2
    var w = window.innerWidth;
    var h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx2d.scale(dpr, dpr);

    var count = w < 768 ? 80 : 150;   // budget DESIGN.md §5
    var LIFE = 3000;                  // maks 3 detik
    var parts = [];

    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 300 + Math.random() * 600;
      parts.push({
        x: w / 2, y: h / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 200,
        size: 5 + Math.random() * 7,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 8,
        color: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0],
        round: Math.random() < 0.35
      });
    }

    var start = null, last = null, raf = null;

    function frame(ts) {
      if (start === null) { start = ts; last = ts; }
      var dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;

      var elapsed = ts - start;
      if (elapsed >= LIFE) { stop(); return; }

      var fade = elapsed > LIFE - 800 ? (LIFE - elapsed) / 800 : 1;
      ctx2d.clearRect(0, 0, w, h);

      for (var j = 0; j < parts.length; j++) {
        var p = parts[j];
        p.vy += 1400 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;

        ctx2d.save();
        ctx2d.globalAlpha = fade;
        ctx2d.translate(p.x, p.y);
        ctx2d.rotate(p.rot);
        ctx2d.fillStyle = p.color;
        if (p.round) {
          ctx2d.beginPath();
          ctx2d.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx2d.fill();
        } else {
          ctx2d.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx2d.restore();
      }

      raf = window.requestAnimationFrame(frame);
    }

    function stop() {
      if (raf) window.cancelAnimationFrame(raf);
      raf = null;
      parts.length = 0;
      canvas.remove();
    }

    raf = window.requestAnimationFrame(frame);
  }

  /* =======================================================
     SLIDE
     ======================================================= */

  var card = document.getElementById('card');
  var replayBtn = document.getElementById('replay');
  var startBtn = document.getElementById('startBtn');

  function goTo(name) { document.body.dataset.slide = name; }

  function lockReplay(ms) {
    replayBtn.disabled = true;
    window.setTimeout(function () { replayBtn.disabled = false; }, ms);
  }

  function openCard() {
    goTo('card');
    burstConfetti();
    playMelody();
    lockReplay(melodyDuration() * 1000);
    // Fokus ikut pindah — slide sebelumnya di-display:none, jangan
    // tinggalin fokus di body. Sasarannya kartu, bukan tombol replay:
    // replay lagi disabled pas ini jalan.
    window.setTimeout(function () { card.focus(); }, 100);
  }

  /* =======================================================
     SIGNATURE INTERACTION — tiup lilin
     Deteksi mikrofon = bonus. Jalur manual selalu ada. DESIGN.md §8
     ======================================================= */

  var CAKE = (function () {
    var COUNT = 16;
    var ARM_MS = 250;        // tiupan harus bertahan segini sebelum ngefek
    var KILL_MS = 110;       // jarak antar lilin padam
    var CALIB_MS = 600;      // ngukur derau ruangan dulu
    var FALLBACK_MS = 12000; // ga kedeteksi apa-apa -> tawarin tombol

    /* ---- Ambang deteksi tiupan ----
       Angka ini ga bisa dites tanpa mikrofon beneran. Buka halaman ini
       dengan ?debug=1 di HP buat liat angka low/high/ratio secara live,
       terus setel di sini:
       - lilin susah mati        -> turunin LOW_MARGIN, atau turunin RATIO_MIN
       - lilin mati sendiri       -> naikin LOW_MARGIN
       - kepicu suara ngobrol     -> naikin RATIO_MIN (ngobrol punya energi tinggi) */
    var LOW_MARGIN = 25;     // seberapa jauh di atas derau ruangan
    var LOW_MIN = 30;        // lantai absolut, biar ruangan sunyi banget ga jadi hair-trigger
    var RATIO_MIN = 1.6;     // dominasi pita rendah banding pita tinggi

    var DEBUG = /[?&]debug=1/.test(location.search);
    var debugEl = document.getElementById('micDebug');

    var wrap = document.getElementById('candles');
    var statusEl = document.getElementById('cakeStatus');
    var privacyEl = document.getElementById('privacyNote');
    var manualBtn = document.getElementById('manualBtn');

    var candles = [];
    var out = 0;
    var done = false;

    var stream = null, analyser = null, srcNode = null, data = null, sampleRate = 48000;
    var raf = null, lastTs = null, fallbackTimer = null;
    var baseline = null, calibSum = 0, calibN = 0, calibMs = 0;
    var blowMs = 0, armed = false, sinceKill = 0;

    var STATUS = {
      asking: 'Izinin mikrofonnya dulu ya',
      calibrating: 'Dengerin sekitar bentar...',
      listening: 'Sekarang tiup lilinnya',
      denied: 'Nggak apa-apa — pakai tombol aja',
      nomic: 'Browser ini nggak bisa akses mikrofon',
      done: 'Lilinnya mati semua'
    };

    function setStatus(key) { statusEl.textContent = STATUS[key]; }

    function build() {
      var frag = document.createDocumentFragment();
      for (var i = 0; i < COUNT; i++) {
        var c = document.createElement('span');
        c.className = 'candle';
        var f = document.createElement('span');
        f.className = 'flame';
        c.appendChild(f);
        frag.appendChild(c);
        candles.push(c);
      }
      wrap.appendChild(frag);
    }

    function kill() {
      if (out >= COUNT) return;
      candles[out].classList.add('is-out');
      out++;
    }

    function avg(arr, from, to) {
      var s = 0, n = 0;
      for (var i = from; i <= to && i < arr.length; i++) { s += arr[i]; n++; }
      return n ? s / n : 0;
    }

    function loop(ts) {
      if (lastTs === null) lastTs = ts;
      var dt = Math.min(ts - lastTs, 100);
      lastTs = ts;

      analyser.getByteFrequencyData(data);

      var binHz = sampleRate / analyser.fftSize;
      var lowTo = Math.max(2, Math.round(300 / binHz));
      var hiFrom = Math.round(1000 / binHz);
      var hiTo = Math.round(6000 / binHz);

      var low = avg(data, 1, lowTo);
      var high = avg(data, hiFrom, hiTo);

      // Kalibrasi derau ruangan dulu — ambang angka mati ga jalan,
      // kamar sepi dan kamar berkipas beda jauh.
      if (baseline === null) {
        calibSum += low; calibN++; calibMs += dt;
        if (calibMs >= CALIB_MS) {
          baseline = calibN ? calibSum / calibN : 0;
          setStatus('listening');
        }
        raf = window.requestAnimationFrame(loop);
        return;
      }

      // Tiupan = energi pita rendah yang dominan DAN bertahan.
      // Teriak & tepuk tangan juga keras, tapi ga low-heavy.
      var ratio = low / (high + 1);
      var blowing = low > baseline + LOW_MARGIN && low > LOW_MIN && ratio > RATIO_MIN;

      if (DEBUG && debugEl) {
        debugEl.textContent =
          'low ' + low.toFixed(0) + ' (butuh >' + Math.max(baseline + LOW_MARGIN, LOW_MIN).toFixed(0) + ')' +
          ' | high ' + high.toFixed(0) +
          ' | ratio ' + ratio.toFixed(2) + ' (butuh >' + RATIO_MIN + ')' +
          ' | derau ' + baseline.toFixed(0) +
          ' | ' + (blowing ? 'NIUP' : '-');
      }

      if (blowing) {
        blowMs += dt;
        if (!armed && blowMs >= ARM_MS) {
          armed = true;
          kill();                // lilin pertama padam pas tiupan kebukti
        } else if (armed) {
          sinceKill += dt;
          while (sinceKill >= KILL_MS && out < COUNT) { sinceKill -= KILL_MS; kill(); }
        }
      } else {
        blowMs = 0;
        sinceKill = 0;
        // `armed` sengaja ga di-reset: sekali kebukti niup, ga usah
        // ngumpulin 250ms lagi cuma gara-gara ngambil napas.
      }

      if (out >= COUNT) { finish(); return; }
      raf = window.requestAnimationFrame(loop);
    }

    function stopMic() {
      if (raf) { window.cancelAnimationFrame(raf); raf = null; }
      if (fallbackTimer) { window.clearTimeout(fallbackTimer); fallbackTimer = null; }
      if (srcNode) { srcNode.disconnect(); srcNode = null; }
      // Wajib: tanpa ini, indikator "sedang merekam" di HP nyala terus.
      if (stream) {
        var tracks = stream.getTracks();
        for (var i = 0; i < tracks.length; i++) tracks[i].stop();
        stream = null;
      }
      analyser = null;
    }

    function showManual() {
      manualBtn.hidden = false;
    }

    function manualMode(reason) {
      stopMic();
      setStatus(reason);
      privacyEl.hidden = true;    // ga ada mikrofon dipakai, ga usah janji apa-apa
      showManual();
    }

    function finish() {
      if (done) return;
      done = true;
      stopMic();
      setStatus('done');
      manualBtn.hidden = true;
      // Kasih jeda buat asapnya naik dulu, baru pindah slide
      window.setTimeout(openCard, reduceMotion.matches ? 200 : 900);
    }

    function manualBlow() {
      manualBtn.disabled = true;
      stopMic();
      var timer = window.setInterval(function () {
        kill();
        if (out >= COUNT) { window.clearInterval(timer); finish(); }
      }, reduceMotion.matches ? 20 : 90);
    }

    var started = false;

    function start() {
      if (started) return;   // tanpa ini, panggilan kedua nambah 16 lilin lagi
      started = true;

      build();
      setStatus('asking');

      // file:// atau browser lawas -> API-nya ga eksis. Langsung manual.
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        manualMode('nomic');
        return;
      }

      navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,   // ini justru ngebuang derau angin yang mau dideteksi
          autoGainControl: false
        }
      }).then(function (s) {
        if (done) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
        stream = s;
        var rig = AUDIO.analyserFor(s);
        if (!rig) { manualMode('nomic'); return; }

        analyser = rig.analyser;
        srcNode = rig.source;
        sampleRate = rig.sampleRate;
        data = new Uint8Array(analyser.frequencyBinCount);

        setStatus('calibrating');
        // Baru ditampilin di sini: kalau mikrofonnya ditolak, panelnya
        // ga akan pernah keisi — mending ga usah muncul sama sekali.
        if (DEBUG && debugEl) debugEl.hidden = false;
        fallbackTimer = window.setTimeout(function () {
          if (!done) showManual();     // status ga diubah — mikrofon masih jalan
        }, FALLBACK_MS);

        raf = window.requestAnimationFrame(loop);
      }).catch(function () {
        manualMode('denied');
      });
    }

    manualBtn.addEventListener('click', manualBlow);

    return { start: start, stopMic: stopMic };
  })();

  /* =======================================================
     Tombol
     ======================================================= */

  startBtn.addEventListener('click', function () {
    AUDIO.ensure();     // gesture user — di sinilah audio boleh lahir
    goTo('cake');
    CAKE.start();
  });

  replayBtn.addEventListener('click', function () {
    if (Date.now() < melodyBusyUntil) return;
    playMelody();
    lockReplay(melodyDuration() * 1000);
  });

  var soundBtn = document.getElementById('soundToggle');
  var label = soundBtn.querySelector('.sr-only');

  soundBtn.addEventListener('click', function () {
    var next = !AUDIO.isMuted();
    AUDIO.setMuted(next);
    soundBtn.setAttribute('aria-pressed', String(next));
    label.textContent = next ? 'Nyalakan suara' : 'Matikan suara';
  });

  /* Tab pindah -> suara berhenti. Musik dari tab background bikin orang bingung. */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { AUDIO.suspend(); } else { AUDIO.resume(); }
  });

  /* Tinggalin halaman -> lepas mikrofon, jangan gantung */
  window.addEventListener('pagehide', function () { CAKE.stopMic(); });

})();
