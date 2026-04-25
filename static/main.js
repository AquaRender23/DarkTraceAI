// ═══════════════════════════════════════════════════════
//  CYBER SHIELD – DarkTrace AI  |  main.js  (v2)
// ═══════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. AMBIENT PARTICLE CANVAS ── */
  createParticles();

  /* ── 2. NAV LINKS CLICK ── */
  document.querySelectorAll('.nav-links li').forEach(li => {
    li.addEventListener('click', () => {
      document.querySelectorAll('.nav-links li').forEach(x => x.classList.remove('active'));
      li.classList.add('active');
    });
  });

  /* ── 3. LIVE EVENT LOG TICKER ── */
  startEventTicker();

  /* ── 4. STAT COUNTER ANIMATION ── */
  animateCounters();

  /* ── 5. CTA BUTTON RIPPLE ── */
  const cta = document.querySelector('.cta-btn');
  if (cta) {
    cta.addEventListener('click', () => {
      cta.style.transform = 'scale(0.97)';
      setTimeout(() => cta.style.transform = '', 150);
    });
  }

  /* ── 6. MIC BUTTON TOGGLE ── */
  const mic = document.querySelector('.mic-btn');
  if (mic) {
    let active = false;
    mic.addEventListener('click', () => {
      active = !active;
      mic.style.background = active
        ? 'radial-gradient(circle, rgba(0,200,255,0.55), rgba(0,100,200,0.35))'
        : '';
      mic.style.boxShadow = active
        ? '0 0 28px rgba(0,200,255,1), 0 0 60px rgba(0,200,255,0.5)'
        : '';
    });
  }

  /* ── 7. CHART SELECT DROPDOWNS ── */
  document.querySelectorAll('.chart-select').forEach(sel => {
    sel.addEventListener('change', () => {
      sel.style.color = 'rgba(0,200,255,0.9)';
    });
  });

});

/* ══════════════════════════════════════════
   AMBIENT PARTICLE SYSTEM
   ══════════════════════════════════════════ */
function createParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'particleCanvas';
  canvas.style.cssText = `
    position: fixed; top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none; z-index: 0;
    opacity: 0.5;
  `;
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx  = canvas.getContext('2d');
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  const COLORS = ['rgba(0,200,255,', 'rgba(100,100,255,', 'rgba(155,81,255,'];

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x   = Math.random() * W;
      this.y   = init ? Math.random() * H : H + 5;
      this.r   = Math.random() * 1.4 + 0.4;
      this.vy  = -(Math.random() * 0.4 + 0.15);
      this.vx  = (Math.random() - 0.5) * 0.2;
      this.col = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.a   = Math.random() * 0.6 + 0.2;
      this.life = 0;
      this.maxLife = Math.random() * 300 + 150;
    }
    draw() {
      const prog  = this.life / this.maxLife;
      const alpha = this.a * (prog < 0.1 ? prog / 0.1 : prog > 0.85 ? (1 - prog) / 0.15 : 1);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle   = this.col + alpha + ')';
      ctx.shadowBlur  = 8;
      ctx.shadowColor = this.col + '0.8)';
      ctx.fill();
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    }
  }

  const particles = Array.from({ length: 120 }, () => new Particle());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
}

/* ══════════════════════════════════════════
   LIVE EVENT LOG TICKER
   ══════════════════════════════════════════ */
function startEventTicker() {
  const events = [
    { icon: 'fa-exclamation-triangle', cls: 'red',    title: 'DDoS Attack Detected',      sub: 'Firewall-3' },
    { icon: 'fa-bug',                  cls: 'orange',  title: 'Malware Activity Detected',  sub: 'Firewall-2' },
    { icon: 'fa-shield-alt',           cls: 'green',   title: 'Phishing Attempt Blocked',   sub: 'Firewall-1' },
    { icon: 'fa-info-circle',          cls: 'blue',    title: 'Suspicious Login Detected',  sub: 'Firewall-4' },
    { icon: 'fa-exclamation-triangle', cls: 'red',     title: 'DDoS Attack Detected',       sub: 'Firewall-5' },
    { icon: 'fa-radiation',            cls: 'orange',  title: 'Port Scan Attempt',          sub: 'Firewall-1' },
    { icon: 'fa-shield-alt',           cls: 'green',   title: 'Brute Force Blocked',        sub: 'Firewall-3' },
  ];

  let idx = 0;
  setInterval(() => {
    const list = document.querySelector('.event-list');
    if (!list) return;

    idx = (idx + 1) % events.length;
    const e = events[idx];
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: true });

    const li = document.createElement('li');
    li.classList.add('event-item');
    li.style.opacity   = '0';
    li.style.transform = 'translateX(-10px)';
    li.style.transition = 'all 0.4s ease';
    li.innerHTML = `
      <span class="event-icon ${e.cls}"><i class="fas ${e.icon}"></i></span>
      <div class="event-info">
        <p class="event-title">${e.title}</p>
        <p class="event-sub">${e.sub}</p>
      </div>
      <span class="event-time">${timeStr}</span>
    `;

    list.insertBefore(li, list.firstChild);
    requestAnimationFrame(() => {
      li.style.opacity   = '1';
      li.style.transform = 'translateX(0)';
    });

    const items = list.querySelectorAll('.event-item');
    if (items.length > 8) {
      const last = items[items.length - 1];
      last.style.transition = 'opacity 0.3s';
      last.style.opacity = '0';
      setTimeout(() => last.remove(), 300);
    }
  }, 5000);
}

/* ══════════════════════════════════════════
   ANIMATED STAT COUNTERS
   ══════════════════════════════════════════ */
function animateCounters() {
  const targets = [
    { selector: '.stat-card.red .stat-value',    end: 1248, suffix: '' },
    { selector: '.stat-card.orange .stat-value', end: 24,   suffix: '' },
    { selector: '.stat-card.green .stat-value',  end: 92.6, suffix: '%', decimals: 1 },
  ];

  targets.forEach(t => {
    const el = document.querySelector(t.selector);
    if (!el) return;
    const duration = 1600;
    const startTime = performance.now();

    function tick(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      const value    = t.end * ease;
      const display  = t.decimals ? value.toFixed(t.decimals) : Math.floor(value).toLocaleString();
      el.textContent = display + t.suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

/* ══════════════════════════════════════════
   NEON CURSOR TRAIL
   ══════════════════════════════════════════ */
(function cursorTrail() {
  const trail = [];
  const MAX   = 8;

  document.addEventListener('mousemove', e => {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: fixed; left: ${e.clientX}px; top: ${e.clientY}px;
      width: 6px; height: 6px; border-radius: 50%;
      background: rgba(0,200,255,0.55);
      box-shadow: 0 0 10px rgba(0,200,255,0.8);
      pointer-events: none; z-index: 9999;
      transform: translate(-50%,-50%);
      transition: opacity 0.4s, transform 0.4s;
    `;
    document.body.appendChild(dot);
    trail.push(dot);

    if (trail.length > MAX) {
      const old = trail.shift();
      old.style.opacity   = '0';
      old.style.transform = 'translate(-50%,-50%) scale(0)';
      setTimeout(() => old.remove(), 400);
    }

    setTimeout(() => {
      dot.style.opacity   = '0';
      dot.style.transform = 'translate(-50%,-50%) scale(0)';
      setTimeout(() => {
        dot.remove();
        const i = trail.indexOf(dot);
        if (i > -1) trail.splice(i, 1);
      }, 400);
    }, 300);
  });
})();