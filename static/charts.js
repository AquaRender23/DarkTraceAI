// ═══════════════════════════════════════════════════════
//  CYBER SHIELD – DarkTrace AI  |  charts.js  (v2)
//  Requires Chart.js 4.x loaded dynamically
// ═══════════════════════════════════════════════════════

(function loadChartJS() {
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
  s.onload = initCharts;
  document.head.appendChild(s);
})();

function initCharts() {

  // ── SHARED GLOW PLUGIN ──
  const glowPlugin = {
    id: 'glowLines',
    beforeDatasetsDraw(chart, args, opts) {
      chart.ctx.save();
      chart.ctx.shadowBlur  = opts.blur  ?? 16;
      chart.ctx.shadowColor = opts.color ?? 'rgba(0,200,255,0.9)';
    },
    afterDatasetsDraw(chart) { chart.ctx.restore(); }
  };

  // ══════════════════════════════════════════════
  //  STAT CARD 1 – TOTAL THREATS
  //  Radar (polygon spider) chart
  // ══════════════════════════════════════════════
  const radar1 = document.getElementById('radarChart1');
  if (radar1) {
    const ctx = radar1.getContext('2d');
    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['DDoS','Malware','Phishing','BruteForce','PortScan','Ransom'],
        datasets: [{
          data: [85, 62, 74, 55, 48, 70],
          borderColor: 'rgba(255,69,96,0.85)',
          borderWidth: 1.5,
          backgroundColor: 'rgba(255,69,96,0.12)',
          pointBackgroundColor: 'rgba(255,69,96,0.9)',
          pointBorderColor: '#fff',
          pointRadius: 2.5,
          pointHoverRadius: 4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 1400, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          glowLines: { blur: 14, color: 'rgba(255,69,96,0.85)' },
        },
        scales: {
          r: {
            min: 0, max: 100,
            ticks: { display: false, stepSize: 25 },
            grid: { color: 'rgba(255,69,96,0.12)', lineWidth: 1 },
            angleLines: { color: 'rgba(255,69,96,0.10)' },
            pointLabels: { display: false },
          }
        },
        elements: { line: { borderJoinStyle: 'round' } }
      },
      plugins: [glowPlugin]
    });
  }

  // ══════════════════════════════════════════════
  //  STAT CARD 2 – ACTIVE ATTACKS
  //  Arc / semi-doughnut gauge
  // ══════════════════════════════════════════════
  const gaugeCanvas = document.getElementById('gaugeChart');
  if (gaugeCanvas) {
    const ctx = gaugeCanvas.getContext('2d');

    // Build arc gradient
    const grad = ctx.createLinearGradient(0, 0, gaugeCanvas.offsetWidth || 160, 0);
    grad.addColorStop(0,   'rgba(255,69,96,0.25)');
    grad.addColorStop(0.5, 'rgba(255,153,0,0.70)');
    grad.addColorStop(1,   'rgba(255,200,0,0.90)');

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [24, 76],
          backgroundColor: [grad, 'rgba(255,153,0,0.06)'],
          borderColor: ['rgba(255,153,0,0.85)', 'rgba(0,0,0,0)'],
          borderWidth: [1.5, 0],
          hoverBackgroundColor: [grad, 'rgba(0,0,0,0)'],
          borderRadius: [6, 0],
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '72%',
        rotation: -110,
        circumference: 220,
        animation: { duration: 1400, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          glowLines: { blur: 18, color: 'rgba(255,153,0,0.85)' },
        },
      },
      plugins: [glowPlugin]
    });
  }

  // ══════════════════════════════════════════════
  //  ATTACK TREND  – unique dual-dataset with
  //  filled area + pulse dots + dash upper bound
  // ══════════════════════════════════════════════
  const trendCanvas = document.getElementById('trendChart');
  if (trendCanvas) {
    const tctx = trendCanvas.getContext('2d');

    // Primary gradient
    const tGrad = tctx.createLinearGradient(0, 0, 0, 185);
    tGrad.addColorStop(0,   'rgba(0,200,255,0.38)');
    tGrad.addColorStop(0.55,'rgba(100,50,255,0.18)');
    tGrad.addColorStop(1,   'rgba(0,50,200,0.01)');

    // Secondary gradient (upper bound band)
    const t2Grad = tctx.createLinearGradient(0, 0, 0, 185);
    t2Grad.addColorStop(0,  'rgba(155,81,255,0.14)');
    t2Grad.addColorStop(1,  'rgba(155,81,255,0.00)');

    const trendData   = [55, 80, 70, 90, 120, 100, 198];
    const upperBound  = [80, 110, 100, 120, 155, 135, 230];

    const trendChart = new Chart(tctx, {
      type: 'line',
      data: {
        labels: ['12 May','13 May','14 May','15 May','16 May','17 May','18 May'],
        datasets: [
          // upper bound band
          {
            data: upperBound,
            borderColor: 'rgba(155,81,255,0.35)',
            borderWidth: 1,
            borderDash: [5, 5],
            fill: false,
            tension: 0.45,
            pointRadius: 0,
            pointHoverRadius: 0,
            backgroundColor: t2Grad,
          },
          // primary trend
          {
            data: trendData,
            borderColor: '#00c8ff',
            borderWidth: 2.5,
            fill: '-1',           // fill down to dataset above (band between curves)
            backgroundColor: tGrad,
            tension: 0.45,
            pointRadius: trendData.map((_, i) => i === trendData.length - 1 ? 7 : 3.5),
            pointHoverRadius: 9,
            pointBackgroundColor: trendData.map((_, i) =>
              i === trendData.length - 1 ? '#00c8ff' : 'rgba(0,200,255,0.75)'
            ),
            pointBorderColor: '#fff',
            pointBorderWidth: trendData.map((_, i) => i === trendData.length - 1 ? 2 : 1),
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 1500, easing: 'easeOutQuart' },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0,20,60,0.82)',
            borderColor: 'rgba(0,200,255,0.45)',
            borderWidth: 1,
            titleColor: '#00c8ff',
            bodyColor: '#e8f4ff',
            padding: 10, cornerRadius: 8,
            callbacks: {
              label: ctx => ctx.datasetIndex === 1 ? ` ${ctx.raw} Attacks` : null,
              title: items => items[0].label
            }
          },
          glowLines: { blur: 20, color: 'rgba(0,200,255,0.85)' },
        },
        scales: {
          x: { display: false, grid: { display: false } },
          y: {
            display: true, min: 0, max: 260,
            ticks: { color: 'rgba(200,230,255,0.38)', font: { size: 9 }, stepSize: 50 },
            grid: { color: 'rgba(0,150,255,0.07)', drawBorder: false },
          },
        },
      },
      plugins: [glowPlugin, pointGlowPlugin()]
    });

    // Animate last point pulse ring
    animatePulseRing(trendChart);
  }

  // ══════════════════════════════════════════════
  //  ATTACKS BY FIREWALL – TOP 7 horizontal-feel
  //  vertical bars with neon gradient per bar
  // ══════════════════════════════════════════════
  const barCanvas = document.getElementById('barChart');
  if (barCanvas) {
    const bctx = barCanvas.getContext('2d');

    const fw7Values = [98, 65, 87, 57, 42, 73, 34];
    const fw7Labels = ['FW-1','FW-2','FW-3','FW-4','FW-5','FW-6','FW-7'];
    const fw7Colors = ['#00c8ff','#2196f3','#9b51ff','#ff4dca','#ff4560','#00e396','#ff9900'];

    const barGradients = fw7Colors.map((c, i) => {
      const g = bctx.createLinearGradient(0, 0, 0, 185);
      g.addColorStop(0,   c + 'ee');
      g.addColorStop(0.5, c + '99');
      g.addColorStop(1,   c + '22');
      return g;
    });

    new Chart(bctx, {
      type: 'bar',
      data: {
        labels: fw7Labels,
        datasets: [{
          data: fw7Values,
          backgroundColor: barGradients,
          borderColor: fw7Colors.map(c => c),
          borderWidth: 1.5,
          borderRadius: 7,
          borderSkipped: false,
          hoverBackgroundColor: fw7Colors.map(c => c + 'ee'),
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: {
          duration: 1300, easing: 'easeOutQuart',
          delay: ctx => ctx.dataIndex * 80,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0,20,60,0.82)',
            borderColor: 'rgba(0,200,255,0.45)',
            borderWidth: 1,
            titleColor: '#00c8ff',
            bodyColor: '#e8f4ff',
            padding: 10, cornerRadius: 8,
            callbacks: { label: ctx => ` ${ctx.raw} Attacks` }
          },
          glowLines: { blur: 22, color: 'rgba(100,100,255,0.7)' },
        },
        scales: {
          x: { display: false, grid: { display: false } },
          y: {
            display: true, min: 0, max: 130,
            ticks: { color: 'rgba(200,230,255,0.38)', font: { size: 9 }, stepSize: 25 },
            grid: { color: 'rgba(0,150,255,0.07)', drawBorder: false },
          },
        },
      },
      plugins: [glowPlugin, barLabelPlugin(fw7Values, fw7Colors)]
    });
  }
}

/* ── Pulse ring on last data point ── */
function animatePulseRing(chart) {
  let radius = 0, growing = true;
  function draw() {
    const ds = chart.getDatasetMeta(1);
    if (!ds || !ds.data.length) { requestAnimationFrame(draw); return; }
    const lastPt = ds.data[ds.data.length - 1];
    const ctx = chart.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(lastPt.x, lastPt.y, 7 + radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0,200,255,${0.55 - radius * 0.022})`;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(0,200,255,0.8)';
    ctx.stroke();
    ctx.restore();
    radius += growing ? 0.5 : -0.5;
    if (radius > 12) growing = false;
    if (radius < 0)  growing = true;
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

/* ── Point glow plugin ── */
function pointGlowPlugin() {
  return {
    id: 'pointGlow',
    afterDraw(chart) {
      const { ctx } = chart;
      chart.data.datasets.forEach((ds, dsIdx) => {
        if (dsIdx !== 1) return; // only primary trend
        const meta = chart.getDatasetMeta(dsIdx);
        meta.data.forEach((pt, i) => {
          const r = Array.isArray(ds.pointRadius) ? ds.pointRadius[i] : ds.pointRadius ?? 3;
          if (!r) return;
          ctx.save();
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, r + 5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0,0,0,0)';
          ctx.shadowBlur = 24;
          ctx.shadowColor = 'rgba(0,200,255,1)';
          ctx.fill();
          ctx.restore();
        });
      });
    }
  };
}

/* ── Bar value label plugin ── */
function barLabelPlugin(values, colors) {
  return {
    id: 'barLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      chart.data.datasets.forEach((ds, dsIdx) => {
        const meta = chart.getDatasetMeta(dsIdx);
        meta.data.forEach((bar, i) => {
          ctx.save();
          ctx.fillStyle = colors[i] || '#fff';
          ctx.font = 'bold 10px Poppins, sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowBlur = 8;
          ctx.shadowColor = colors[i] || '#fff';
          ctx.fillText(values[i], bar.x, bar.y - 6);
          ctx.restore();
        });
      });
    }
  };
}

document.addEventListener("DOMContentLoaded", function () {

    // ===== TRAFFIC OVERVIEW =====
    const trafficCtx = document.getElementById("trafficChart");

    if (trafficCtx) {
        new Chart(trafficCtx, {
            type: "line",
            data: {
                labels: ["00:00","04:00","08:00","12:00","16:00","20:00","24:00"],
                datasets: [
                    {
                        label: "Incoming Traffic",
                        data: [200, 600, 800, 500, 900, 700, 1000],
                        borderColor: "#00e5ff",
                        backgroundColor: "rgba(0,229,255,0.1)",
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: "Outgoing Traffic",
                        data: [150, 400, 600, 450, 700, 650, 900],
                        borderColor: "#00ff9f",
                        backgroundColor: "rgba(0,255,159,0.1)",
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: "#fff" } } },
                scales: {
                    x: { ticks: { color: "#aaa" } },
                    y: { ticks: { color: "#aaa" } }
                }
            }
        });
    }

    // ===== THREAT MAP (SIMULATED DOTS) =====
    const mapCanvas = document.getElementById("threatMap");

    if (mapCanvas) {
        const ctx = mapCanvas.getContext("2d");

        mapCanvas.width = mapCanvas.offsetWidth;
        mapCanvas.height = 250;

        const points = [
            {x:50,y:80}, {x:200,y:100}, {x:350,y:60},
            {x:500,y:120}, {x:650,y:90}, {x:800,y:140}
        ];

        function drawMap() {
            ctx.clearRect(0,0,mapCanvas.width,mapCanvas.height);

            points.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
                ctx.fillStyle = "red";
                ctx.shadowBlur = 15;
                ctx.shadowColor = "red";
                ctx.fill();
            });

            requestAnimationFrame(drawMap);
        }

        drawMap();
    }

});