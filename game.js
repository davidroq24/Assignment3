const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = 800, H = 400;

function initLunarGame() {
  const { Engine, Bodies, Body, Composite } = Matter;
  const engine = Engine.create();
  engine.gravity.y = 0.35;

  const astro = { x: 130, y: H - 82, angle: -0.4 };
  let aiming = false, p0 = null, p1 = null, shots = 0;

  const stars = Array.from({ length: 45 }, (_, i) => ({
    x: (i * 89) % W,
    y: 15 + ((i * 47) % 210),
    r: i % 4 === 0 ? 2 : 1.1
  }));

  function resetWorld() {
    Composite.clear(engine.world, false);
    shots = 0;
    document.getElementById('shots').textContent = '0';

    const ground = Bodies.rectangle(W / 2, H - 17, W + 40, 34, { isStatic: true, friction: 0.85 });
    ground.tag = 'ground';
    const wallR = Bodies.rectangle(W + 25, H / 2, 50, H * 2, { isStatic: true });
    const wallL = Bodies.rectangle(-25, H / 2, 50, H * 2, { isStatic: true });

    const rocks = [];
    const rad = 25;
    const rows = [4, 3, 2, 1];
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r]; c++) {
        const x = 500 + r * (rad * 0.92) + c * (rad * 1.88);
        const y = H - 34 - rad - r * (rad * 1.72);
        const hex = Bodies.polygon(x, y, 6, rad, { friction: 0.75, restitution: 0.25, density: 0.003 });
        hex.tag = 'rock';
        hex.fill = (r + c) % 2 === 0 ? '#9ca3af' : '#6b7280';
        rocks.push(hex);
      }
    }
    Composite.add(engine.world, [ground, wallR, wallL, ...rocks]);
  }

  function fireOrb(vx, vy) {
    const hx = astro.x + Math.cos(astro.angle) * 32;
    const hy = astro.y - 10 + Math.sin(astro.angle) * 32;
    const orb = Bodies.circle(hx, hy, 12, { density: 0.0045, restitution: 0.72, friction: 0.2 });
    orb.tag = 'orb';
    Body.setVelocity(orb, { x: vx, y: vy });
    Composite.add(engine.world, orb);
    shots++;
    document.getElementById('shots').textContent = shots;
  }

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx - r.left) * (W / r.width), y: (cy - r.top) * (H / r.height) };
  }

  canvas.addEventListener('mousedown', (e) => { aiming = true; p0 = p1 = pos(e); });
  window.addEventListener('mousemove', (e) => {
    if (!aiming) return;
    p1 = pos(e);
    const dx = p0.x - p1.x, dy = p0.y - p1.y;
    if (Math.hypot(dx, dy) > 6) astro.angle = Math.max(-1.35, Math.min(0.35, Math.atan2(dy, dx)));
  });
  window.addEventListener('mouseup', () => {
    if (!aiming) return;
    aiming = false;
    const power = Math.min(Math.hypot(p0.x - p1.x, p0.y - p1.y), 180);
    const speed = power > 12 ? power * 0.14 : 15;
    fireOrb(Math.cos(astro.angle) * speed, Math.sin(astro.angle) * speed);
  });

  function drawEarth() {
    const ex = 665, ey = 85, er = 46;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.beginPath(); ctx.arc(ex, ey, er + 10, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(ex - er, ey - er, er * 2, er * 2);
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(ex - 15, ey - 8, 17, 11, 0.3, 0, Math.PI * 2);
    ctx.ellipse(ex + 16, ey + 11, 19, 13, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillRect(ex - 30, ey - 4, 32, 6);
    ctx.fillRect(ex - 4, ey + 16, 34, 6);
    ctx.restore();

    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.stroke();
  }

  function drawAstronaut() {
    ctx.save();
    ctx.translate(astro.x, astro.y);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#141413';

    ctx.fillStyle = '#a8a29e';
    ctx.fillRect(-26, -22, 14, 34); ctx.strokeRect(-26, -22, 14, 34);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-13, 18, 11, 22); ctx.strokeRect(-13, 18, 11, 22);
    ctx.fillRect(2, 18, 11, 22); ctx.strokeRect(2, 18, 11, 22);
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-15, 36, 15, 9); ctx.strokeRect(-15, 36, 15, 9);
    ctx.fillRect(1, 36, 15, 9); ctx.strokeRect(1, 36, 15, 9);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-16, -22, 32, 42); ctx.strokeRect(-16, -22, 32, 42);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-7, -10, 14, 11); ctx.strokeRect(-7, -10, 14, 11);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(0, -40, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(-8, -50, 24, 18); ctx.strokeRect(-8, -50, 24, 18);
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(6, -46, 7, 4);

    ctx.beginPath(); ctx.moveTo(-10, -60); ctx.lineTo(-14, -72); ctx.stroke();
    ctx.fillStyle = '#facc15';
    ctx.beginPath(); ctx.arc(-14, -74, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.save();
    ctx.translate(4, -10);
    ctx.rotate(astro.angle);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, -5, 28, 10); ctx.strokeRect(0, -5, 28, 10);

    ctx.fillStyle = '#facc15';
    ctx.beginPath(); ctx.arc(32, 0, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fef9c3';
    ctx.beginPath(); ctx.arc(28, -3, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  function drawMoon() {
    ctx.fillStyle = '#d6d3d1';
    ctx.fillRect(0, H - 34, W, 34);
    ctx.strokeStyle = '#141413';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, H - 34); ctx.lineTo(W, H - 34); ctx.stroke();

    const craters = [[70, H - 18, 20, 6], [250, H - 15, 28, 8], [400, H - 20, 16, 5], [715, H - 16, 26, 7]];
    for (const [cx, cy, rx, ry] of craters) {
      ctx.fillStyle = '#a8a29e';
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#57534e';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function drawBody(b) {
    if (!b.tag || b.tag === 'ground') return;
    const v = b.vertices;
    ctx.beginPath();
    ctx.moveTo(v[0].x, v[0].y);
    for (let i = 1; i < v.length; i++) ctx.lineTo(v[i].x, v[i].y);
    ctx.closePath();

    if (b.tag === 'rock') {
      ctx.fillStyle = b.fill;
      ctx.fill();
      ctx.strokeStyle = '#141413';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (b.tag === 'orb') {
      ctx.fillStyle = '#facc15';
      ctx.fill();
      ctx.strokeStyle = '#141413';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = '#fef9c3';
      ctx.beginPath(); ctx.arc(b.position.x - 3, b.position.y - 3, 3.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  let last = performance.now();
  function loop(now) {
    Engine.update(engine, Math.min(now - last, 32));
    last = now;

    ctx.fillStyle = '#0d0f1a';
    ctx.fillRect(0, 0, W, H);

    for (const s of stars) {
      ctx.fillStyle = s.r > 1.5 ? '#facc15' : '#e5e7eb';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    }

    drawEarth();
    drawMoon();
    drawAstronaut();

    if (aiming && p0 && p1) {
      const power = Math.min(Math.hypot(p0.x - p1.x, p0.y - p1.y), 180);
      const speed = Math.max(power * 0.14, 10);
      const sx = astro.x + Math.cos(astro.angle) * 32;
      const sy = astro.y - 10 + Math.sin(astro.angle) * 32;
      const vx = Math.cos(astro.angle) * speed;
      const vy = Math.sin(astro.angle) * speed;
      ctx.fillStyle = '#facc15';
      for (let t = 2; t <= 16; t += 2) {
        ctx.beginPath();
        ctx.arc(sx + vx * t, sy + vy * t + 0.5 * (engine.gravity.y * 0.25) * t * t, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    Composite.allBodies(engine.world).forEach(drawBody);
    requestAnimationFrame(loop);
  }

  document.getElementById('reset-btn').addEventListener('click', resetWorld);
  document.querySelectorAll('.grav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.grav-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      engine.gravity.y = parseFloat(btn.dataset.g);
    });
  });

  resetWorld();
  requestAnimationFrame(loop);
}

const wait = setInterval(() => {
  if (typeof Matter !== 'undefined') {
    clearInterval(wait);
    initLunarGame();
  }
}, 40);
