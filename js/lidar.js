/* ===============================================================
   lidar.js — the hero's live point cloud.

   An illustrative street scene as a spinning 64-beam LiDAR sees it,
   with 3D detection boxes over the objects: the task the GLE-SSD-VR
   thesis model performs. It is drawn, not a recording, and the
   caption says so.

   How the scene is built (once, from a fixed seed, so it is the
   same on every visit):
     - ground returns fall on concentric rings, one per beam, at the
       range where that beam's elevation angle meets the road;
     - walls, cars, pedestrians and the cyclist are sampled the way
       the beams actually strike them, so they carry the horizontal
       scan-line striping of real LiDAR, and only faces turned
       towards the sensor return points;
     - every object casts a shadow: ground behind it, within its
       angular span, is removed, as a real sensor would see it.

   Budget: no library, canvas 2D only. Points are drawn in a handful
   of alpha buckets so the fill style changes a few times per frame,
   not once per point. Capped at 30 fps, paused when off-screen or
   when the tab is hidden. Under prefers-reduced-motion it draws one
   still frame and never animates; dragging still works, because
   that motion is the visitor's own. Without JavaScript the figure
   stays hidden and the hero is the text alone.
   =============================================================== */
(function () {
  var canvas = document.getElementById('lidar');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var root = document.documentElement;
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- deterministic randomness ---------- */
  var seed = 20240827;
  function rand() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  function gauss() { return (rand() + rand() + rand() - 1.5) * 0.8; }

  /* ---------- sensor model ---------- */
  var H = 1.73;                         // sensor height above the road, m
  var BEAMS = [];                       // elevation angles, radians
  for (var b = 0; b < 64; b++) BEAMS.push((-24.8 + b * (26.8 / 63)) * Math.PI / 180);
  var RANGE = 42;
  var STREET = 13.5;                    // building line, either side

  /* ---------- objects (KITTI-like classes and dimensions) ---------- */
  var OBJ = [
    { k: 'car',        s: 0.96, x:  3.3, y:  9.0, yaw: 0.00, l: 4.2, w: 1.8, h: 1.50 },
    { k: 'car',        s: 0.93, x: -3.1, y: 16.0, yaw: Math.PI, l: 4.4, w: 1.85, h: 1.55 },
    { k: 'car',        s: 0.89, x:  3.5, y: 23.5, yaw: 0.04, l: 4.0, w: 1.75, h: 1.45 },
    { k: 'car',        s: 0.91, x: -7.6, y: -5.5, yaw: 0.02, l: 4.3, w: 1.8, h: 1.50 },
    { k: 'cyclist',    s: 0.86, x: -1.7, y: -9.5, yaw: 0.00, l: 1.8, w: 0.6, h: 1.70 },
    { k: 'pedestrian', s: 0.88, x:  9.4, y:  5.8, yaw: 0.6,  l: 0.6, w: 0.6, h: 1.75 },
    { k: 'pedestrian', s: 0.82, x: 10.4, y: 11.6, yaw: 0.4,  l: 0.6, w: 0.6, h: 1.70 }
  ];

  var P = [];                           // points: [x, y, z, azimuth, isObject]
  function add(x, y, z, obj) {
    P.push([x, y, z, Math.atan2(x, y), obj ? 1 : 0]);
  }

  /* angular shadows cast by each object, as seen from the sensor */
  function shadowOf(o) {
    var c = Math.cos(o.yaw), s = Math.sin(o.yaw), lo = Infinity, hi = -Infinity, near = Infinity;
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function (q) {
      var px = o.x + q[0] * o.w / 2 * c + q[1] * o.l / 2 * s;
      var py = o.y - q[0] * o.w / 2 * s + q[1] * o.l / 2 * c;
      var a = Math.atan2(px, py);
      lo = Math.min(lo, a); hi = Math.max(hi, a);
      near = Math.min(near, Math.hypot(px, py));
    });
    return { lo: lo, hi: hi, d: near };
  }
  var SH = OBJ.map(shadowOf);
  function shadowed(x, y) {
    var a = Math.atan2(x, y), r = Math.hypot(x, y);
    for (var i = 0; i < SH.length; i++) {
      if (a > SH[i].lo && a < SH[i].hi && r > SH[i].d) return true;
    }
    return false;
  }

  /* ground rings */
  BEAMS.forEach(function (el) {
    if (el >= -0.02) return;
    var r0 = H / Math.tan(-el);
    if (r0 > RANGE || r0 < 2.2) return;
    var step = 0.55 / Math.max(r0, 6);           // denser near, as in real scans
    for (var a = -Math.PI; a < Math.PI; a += step * (0.85 + rand() * 0.3)) {
      var r = r0 * (1 + gauss() * 0.006);
      var x = Math.sin(a) * r, y = Math.cos(a) * r;
      if (Math.abs(x) > STREET) continue;         // inside the buildings
      if (shadowed(x, y)) continue;
      add(x, y, gauss() * 0.02, false);
    }
  });

  /* height at which a beam strikes a surface at horizontal range d */
  function stripes(d, top) {
    var zs = [];
    for (var i = 0; i < BEAMS.length; i++) {
      var z = H + d * Math.tan(BEAMS[i]);
      if (z > 0.05 && z < top) zs.push(z);
    }
    return zs;
  }

  /* building walls on both sides of the street, with window recesses */
  [-1, 1].forEach(function (side) {
    for (var y = -26; y < 40; y += 0.32) {
      var x = side * STREET;
      var d = Math.hypot(x, y);
      if (d > RANGE || shadowed(x, y)) continue;
      stripes(d, 7.5).forEach(function (z) {
        var bay = (Math.floor((y + 30) / 3.2) % 2 === 0) && z > 1.4 && z < 6.2;
        add(x - side * (bay ? 0.25 : 0) + gauss() * 0.02, y, z, false);
      });
    }
  });

  /* objects: only faces turned towards the sensor return points */
  OBJ.forEach(function (o) {
    var c = Math.cos(o.yaw), s = Math.sin(o.yaw);
    var round = o.k === 'pedestrian';
    var faces = round ? null : [
      { n: [0, 1],  u: [1, 0], len: o.w, off: o.l / 2 },
      { n: [0, -1], u: [1, 0], len: o.w, off: o.l / 2 },
      { n: [1, 0],  u: [0, 1], len: o.l, off: o.w / 2 },
      { n: [-1, 0], u: [0, 1], len: o.l, off: o.w / 2 }
    ];
    function toWorld(lx, ly) { return [o.x + lx * c + ly * s, o.y - lx * s + ly * c]; }
    if (round) {
      for (var t = 0; t < Math.PI * 2; t += 0.35) {
        var w = toWorld(Math.cos(t) * 0.28, Math.sin(t) * 0.28);
        var toS = [-w[0], -w[1]], nn = [w[0] - o.x, w[1] - o.y];
        if (nn[0] * toS[0] + nn[1] * toS[1] <= 0) continue;
        stripes(Math.hypot(w[0], w[1]), o.h).forEach(function (z) { add(w[0], w[1], z, true); });
      }
      return;
    }
    faces.forEach(function (f) {
      var ctr = toWorld(f.n[0] * f.off, f.n[1] * f.off);
      var nw = [f.n[0] * c + f.n[1] * s, -f.n[0] * s + f.n[1] * c];
      if (nw[0] * -ctr[0] + nw[1] * -ctr[1] <= 0) return;   // facing away
      for (var q = -f.len / 2; q <= f.len / 2; q += 0.14) {
        var wp = toWorld(f.n[0] * f.off + f.u[0] * q, f.n[1] * f.off + f.u[1] * q);
        var d = Math.hypot(wp[0], wp[1]);
        stripes(d, o.h).forEach(function (z) {
          /* the cabin is narrower than the body: thin the upper stripes */
          if (o.k === 'car' && z > o.h * 0.62 && Math.abs(q) > f.len * 0.3) return;
          add(wp[0] + gauss() * 0.015, wp[1] + gauss() * 0.015, z, true);
        });
      }
    });
  });

  /* ---------- colours, read from the theme ---------- */
  var COL = {};
  function readColours() {
    var cs = getComputedStyle(root);
    COL.ink = cs.getPropertyValue('--ink').trim() || '#101113';
    COL.ink3 = cs.getPropertyValue('--ink-3').trim() || '#686D75';
    COL.sig = cs.getPropertyValue('--sig').trim() || '#4F46E5';
    COL.bg = cs.getPropertyValue('--bg').trim() || '#FBFBF9';
    COL.mono = cs.getPropertyValue('--mono').trim() || 'monospace';
  }
  readColours();
  new MutationObserver(function () { readColours(); draw(); })
    .observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    readColours(); draw();
  });

  /* ---------- camera ---------- */
  var az = 0.62, el = 0.6;                     // orbit angles
  var T = [0, 6, 0.4];                         // look-at point
  var DIST = 31;
  var W = 0, Hh = 0, DPR = 1;

  function resize() {
    var r = canvas.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(r.width));
    Hh = Math.max(1, Math.round(r.height));
    canvas.width = W * DPR; canvas.height = Hh * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    draw();
  }

  var BUCKETS = 6;
  var bx = [], by = [];
  for (var k = 0; k < BUCKETS * 2; k++) { bx.push([]); by.push([]); }

  var sweep = 0;

  function draw() {
    if (!W) return;
    var ce = Math.cos(el), cx = T[0] + DIST * ce * Math.sin(az), cy = T[1] - DIST * ce * Math.cos(az),
        cz = T[2] + DIST * Math.sin(el);
    var fx = T[0] - cx, fy = T[1] - cy, fz = T[2] - cz, fl = Math.hypot(fx, fy, fz);
    fx /= fl; fy /= fl; fz /= fl;
    var rx = fy, ry = -fx, rl = Math.hypot(rx, ry); rx /= rl; ry /= rl;      // f × up
    var ux = ry * fz, uy = -rx * fz, uz = rx * fy - ry * fx;                  // r × f
    var F = Math.min(W, Hh) * 1.12, ox = W / 2, oy = Hh * 0.55;

    function proj(x, y, z) {
      var dx = x - cx, dy = y - cy, dz = z - cz;
      var zc = dx * fx + dy * fy + dz * fz;
      if (zc < 0.5) return null;
      return [ox + (dx * rx + dy * ry) * F / zc, oy - (dx * ux + dy * uy + dz * uz) * F / zc, zc];
    }

    ctx.clearRect(0, 0, W, Hh);
    for (var i = 0; i < bx.length; i++) { bx[i].length = 0; by[i].length = 0; }

    for (var p = 0; p < P.length; p++) {
      var pt = P[p], s = proj(pt[0], pt[1], pt[2]);
      if (!s || s[0] < -4 || s[0] > W + 4 || s[1] < -4 || s[1] > Hh + 4) continue;
      var depth = 1 - Math.min(1, s[2] / 62);
      var lag = (sweep - pt[3]) % (Math.PI * 2); if (lag < 0) lag += Math.PI * 2;
      var lit = calm ? 0 : Math.max(0, 1 - lag / 1.1);
      var v = Math.min(BUCKETS - 1, Math.floor((depth * 0.75 + (pt[4] ? 0.3 : 0)) * BUCKETS));
      var bucket = lit > 0.25 ? BUCKETS + Math.min(BUCKETS - 1, Math.floor(lit * BUCKETS)) : v;
      bx[bucket].push(s[0]); by[bucket].push(s[1]);
    }

    var size = W < 480 ? 1.3 : 1.6;
    for (var q = 0; q < BUCKETS; q++) {
      ctx.globalAlpha = 0.18 + 0.62 * (q / (BUCKETS - 1));
      ctx.fillStyle = COL.ink3;
      var X = bx[q], Y = by[q];
      for (var n = 0; n < X.length; n++) ctx.fillRect(X[n], Y[n], size, size);
    }
    for (q = 0; q < BUCKETS; q++) {
      ctx.globalAlpha = 0.35 + 0.65 * (q / (BUCKETS - 1));
      ctx.fillStyle = COL.ink;
      X = bx[BUCKETS + q]; Y = by[BUCKETS + q];
      for (n = 0; n < X.length; n++) ctx.fillRect(X[n], Y[n], size, size);
    }
    ctx.globalAlpha = 1;

    /* sensor origin */
    var o = proj(0, 0, 0);
    if (o) { ctx.fillStyle = COL.sig; ctx.fillRect(o[0] - 2.5, o[1] - 2.5, 5, 5); }

    /* detection boxes */
    ctx.lineWidth = 1.15;
    ctx.font = '500 10px ' + COL.mono;
    ctx.textBaseline = 'bottom';
    OBJ.forEach(function (b) {
      var c = Math.cos(b.yaw), s2 = Math.sin(b.yaw), C = [];
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function (qq) {
        var lx = qq[0] * b.w / 2, ly = qq[1] * b.l / 2;
        var wx = b.x + lx * c + ly * s2, wy = b.y - lx * s2 + ly * c;
        C.push(proj(wx, wy, 0), proj(wx, wy, b.h));
      });
      if (C.some(function (v) { return !v; })) return;
      ctx.strokeStyle = COL.sig;
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      for (var e = 0; e < 4; e++) {
        var a0 = C[e * 2], a1 = C[((e + 1) % 4) * 2], t0 = C[e * 2 + 1], t1 = C[((e + 1) % 4) * 2 + 1];
        ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a1[0], a1[1]);
        ctx.moveTo(t0[0], t0[1]); ctx.lineTo(t1[0], t1[1]);
        ctx.moveTo(a0[0], a0[1]); ctx.lineTo(t0[0], t0[1]);
      }
      ctx.stroke();
      /* heading: a line from the box centre to the middle of its front face */
      var hc = proj(b.x, b.y, b.h), hf = proj(b.x + (b.l / 2) * s2, b.y + (b.l / 2) * c, b.h);
      if (hc && hf) { ctx.beginPath(); ctx.moveTo(hc[0], hc[1]); ctx.lineTo(hf[0], hf[1]); ctx.stroke(); }
      /* label above the highest top corner */
      var top = C[1];
      for (var t = 3; t < 8; t += 2) if (C[t][1] < top[1]) top = C[t];
      var label = b.k + ' ' + b.s.toFixed(2), tw = ctx.measureText(label).width;
      /* kept inside the frame: a label cut off at the edge reads as a bug */
      var lx = Math.max(4, Math.min(W - tw - 8, top[0] - 2));
      var ly = Math.max(28, top[1]);
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = COL.bg;
      ctx.fillRect(lx, ly - 16, tw + 6, 13);
      ctx.globalAlpha = 1;
      ctx.fillStyle = COL.sig;
      ctx.fillText(label, lx + 3, ly - 4);
    });
    ctx.globalAlpha = 1;
  }

  /* ---------- running ---------- */
  var visible = true, running = false, last = 0, lastFrame = 0;
  var spin = 0.055;                            // rad/s of orbit
  var sweepRate = Math.PI * 2 / 3.2;           // one revolution per 3.2 s

  function tick(now) {
    if (!running) return;
    requestAnimationFrame(tick);
    if (now - lastFrame < 33) return;          // ~30 fps cap
    var dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now; lastFrame = now;
    if (!dragging) az += spin * dt + velocity; velocity *= 0.92;
    sweep = (sweep + sweepRate * dt) % (Math.PI * 2);
    draw();
  }
  function start() {
    if (calm || running || !visible || document.hidden) return;
    running = true; last = 0; requestAnimationFrame(tick);
  }
  function stop() { running = false; }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      visible ? start() : stop();
    }).observe(canvas);
  }
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });

  /* ---------- drag to orbit ---------- */
  var dragging = false, px0 = 0, py0 = 0, velocity = 0;
  canvas.addEventListener('pointerdown', function (e) {
    dragging = true; px0 = e.clientX; py0 = e.clientY; velocity = 0;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = (e.clientX - px0) * 0.008, dy = (e.clientY - py0) * 0.006;
    px0 = e.clientX; py0 = e.clientY;
    az += dx; el = Math.max(0.18, Math.min(1.3, el + dy));
    velocity = dx * 0.35;
    if (!running) draw();
  });
  function release() { dragging = false; if (calm) velocity = 0; }
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize);
  resize();          // first frame is drawn synchronously, before any animation
  start();
})();
