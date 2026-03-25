/* ── Background Floating Particles ─────────────────────── */
(() => {
  const canvas = document.getElementById('bgParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  const PARTICLE_COUNT = 35;
  const particles = [];
  let burstActive = false;
  let burstTimer = 0;

  const SHAPES = ['cross', 'circle', 'diamond', 'ring', 'dot'];
  const COLORS = [
    'rgba(192, 57, 43, 0.12)',
    'rgba(192, 57, 43, 0.08)',
    'rgba(212, 168, 67, 0.10)',
    'rgba(212, 168, 67, 0.06)',
    'rgba(232, 230, 240, 0.05)',
    'rgba(232, 230, 240, 0.03)'
  ];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function rand(min, max) { return min + Math.random() * (max - min); }

  function createParticle(forceRandom) {
    return {
      x: forceRandom ? rand(0, W) : rand(0, W),
      y: forceRandom ? rand(0, H) : rand(0, H),
      size: rand(4, 14),
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: rand(-0.15, 0.15),
      vy: rand(-0.1, 0.1),
      rotation: rand(0, Math.PI * 2),
      rotationSpeed: rand(-0.003, 0.003),
      // Burst values — overridden during burst
      burstVx: 0,
      burstVy: 0,
      burstRotSpeed: 0,
      opacity: 1
    };
  }

  function init() {
    resize();
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(true));
    }
  }

  /* ── Drawing shapes ─────────────────────────────────── */
  function drawCross(x, y, s, rot, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-s, 0); ctx.lineTo(s, 0);
    ctx.moveTo(0, -s); ctx.lineTo(0, s);
    ctx.stroke();
    ctx.restore();
  }

  function drawCircle(x, y, s, rot, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawDiamond(x, y, s, rot, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-s, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function drawRing(x, y, s, rot, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    // inner dot
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawDot(x, y, s, rot, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, s * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const drawFns = {
    cross: drawCross,
    circle: drawCircle,
    diamond: drawDiamond,
    ring: drawRing,
    dot: drawDot
  };

  /* ── Animation loop ─────────────────────────────────── */
  function update() {
    ctx.clearRect(0, 0, W, H);

    // Decay burst
    if (burstActive) {
      burstTimer--;
      if (burstTimer <= 0) burstActive = false;
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      if (burstActive) {
        // During burst, apply burst velocities that decay
        p.x += p.vx + p.burstVx;
        p.y += p.vy + p.burstVy;
        p.rotation += p.rotationSpeed + p.burstRotSpeed;
        p.burstVx *= 0.96;
        p.burstVy *= 0.96;
        p.burstRotSpeed *= 0.97;
      } else {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        // Slowly zero out any leftover burst
        p.burstVx = 0;
        p.burstVy = 0;
        p.burstRotSpeed = 0;
      }

      // Wrap around edges
      if (p.x < -20) p.x = W + 20;
      if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20;
      if (p.y > H + 20) p.y = -20;

      const fn = drawFns[p.shape];
      if (fn) fn(p.x, p.y, p.size, p.rotation, p.color);
    }

    requestAnimationFrame(update);
  }

  /* ── Burst on slide change ──────────────────────────── */
  window.triggerParticleBurst = function(direction) {
    burstActive = true;
    burstTimer = 40; // ~40 frames of burst

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      // Kick particles in the opposite direction of the slide transition
      const kickX = direction > 0 ? rand(-3, -1) : rand(1, 3);
      p.burstVx = kickX + rand(-1, 1);
      p.burstVy = rand(-1.5, 1.5);
      p.burstRotSpeed = rand(-0.15, 0.15);
    }
  };

  window.addEventListener('resize', resize);
  init();
  update();
})();
