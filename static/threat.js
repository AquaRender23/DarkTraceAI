/* ═══════════════════════════════════════════════
   CYBER SHIELD – THREATS PAGE  |  threat.js
═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. PARTICLE CANVAS ── */
  const canvas  = document.getElementById('particles');
  const ctx     = canvas.getContext('2d');
  let W, H, particles = [], lines = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r  = Math.random() * 1.5 + 0.3;
      this.a  = Math.random() * 0.6 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,180,255,${this.a})`;
      ctx.fill();
    }
  }

  // init particles
  for (let i = 0; i < 120; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,150,255,${0.08 * (1 - d / 100)})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }
  animate();


  /* ── 2. COUNTER ANIMATION ── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start  = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  document.querySelectorAll('.stat-value[data-target]').forEach((el, i) => {
    setTimeout(() => animateCounter(el), i * 150);
  });


  /* ── 3. BAR ANIMATIONS (Intersection Observer) ── */
  function animateBars() {
    document.querySelectorAll('.bar-fill[data-width], .sev-bar-fill[data-width]').forEach(bar => {
      bar.style.width = bar.dataset.width + '%';
    });
  }
  // slight delay so CSS transition fires
  setTimeout(animateBars, 400);


  /* ── 4. DONUT SPIN-IN ANIMATION ── */
  const segs = document.querySelectorAll('.donut-seg');
  segs.forEach((seg, i) => {
    seg.style.opacity = '0';
    setTimeout(() => {
      seg.style.transition = 'opacity 0.4s ease';
      seg.style.opacity = '1';
    }, 300 + i * 120);
  });


  /* ── 5. TABLE SEARCH & FILTER ── */
  const searchInput    = document.getElementById('searchInput');
  const typeFilter     = document.getElementById('typeFilter');
  const severityFilter = document.getElementById('severityFilter');
  const rows           = document.querySelectorAll('#threatTableBody .table-row');

  function filterTable() {
    const query   = searchInput.value.toLowerCase();
    const type    = typeFilter.value;
    const sev     = severityFilter.value;

    rows.forEach(row => {
      const text       = row.textContent.toLowerCase();
      const rowType    = row.dataset.type    || '';
      const rowSev     = row.dataset.severity|| '';

      const matchQuery = query === '' || text.includes(query);
      const matchType  = type === 'All Types'      || rowType === type;
      const matchSev   = sev  === 'All Severity'   || rowSev  === sev;

      row.style.display = (matchQuery && matchType && matchSev) ? '' : 'none';
    });
  }

  searchInput?.addEventListener('input', filterTable);
  typeFilter?.addEventListener('change', filterTable);
  severityFilter?.addEventListener('change', filterTable);


  /* ── 6. EXPORT BUTTON ── */
  document.querySelector('.export-btn')?.addEventListener('click', () => {
    const headers = ['Threat Name','Type','Severity','Source IP','Target IP','Detected At','Status'];
    const csvRows = [headers.join(',')];
    rows.forEach(row => {
      if (row.style.display === 'none') return;
      const cells = Array.from(row.querySelectorAll('td')).slice(0, 7);
      csvRows.push(cells.map(c => `"${c.textContent.trim().replace(/\s+/g,' ')}"`).join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'threat_logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  });


  /* ── 7. PAGINATION BUTTONS ── */
  document.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
      if (!this.querySelector('.fa-chevron-left') && !this.querySelector('.fa-chevron-right')) {
        this.classList.add('active');
      }
    });
  });


  /* ── 8. ACTION BUTTON TOOLTIPS (simple) ── */
  document.querySelectorAll('.act-btn').forEach((btn, i) => {
    const tips = ['View Details', 'Block Threat', 'More Options'];
    btn.title = tips[i % 3];
  });


  /* ── 9. LIVE CLOCK in alerts meta (optional flavor) ── */
  function formatTime() {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }


  /* ── 10. CARD HOVER GLOW ── */
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');
    });
  });


  /* ── 11. BELL NOTIFICATION ANIMATION ── */
  const bell = document.querySelector('.bell-btn');
  if (bell) {
    bell.addEventListener('click', () => {
      bell.style.transform = 'rotate(-15deg)';
      setTimeout(() => bell.style.transform = 'rotate(15deg)', 100);
      setTimeout(() => bell.style.transform = 'rotate(-10deg)', 200);
      setTimeout(() => bell.style.transform = '', 300);
    });
  }


  /* ── 12. SCAN LINE EFFECT on table rows (CSS handled; JS just triggers it) ── */
  let scanIdx = 0;
  setInterval(() => {
    rows.forEach(r => r.classList.remove('scan-highlight'));
    if (rows[scanIdx]) rows[scanIdx].classList.add('scan-highlight');
    scanIdx = (scanIdx + 1) % rows.length;
  }, 2500);

});
