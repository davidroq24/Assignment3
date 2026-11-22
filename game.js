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
    ctx.fillStyle =
