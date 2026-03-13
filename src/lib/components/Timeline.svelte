<script>
  import { onMount, onDestroy } from 'svelte';
  import { getApplianceStatus, STATUS_META } from '$lib/utils/applianceUtils.js';

  /** @type {any[]} */
  export let appliances = [];

  let canvas;
  let chart = null;
  let ChartConstructor = null;

  const now = new Date();
  const currentYearDecimal = now.getFullYear() + now.getMonth() / 12 + now.getDate() / 365;

  /** @param {string} dateStr */
  function toYearDecimal(dateStr) {
    const d = new Date(dateStr);
    return d.getFullYear() + d.getMonth() / 12 + d.getDate() / 365;
  }

  function buildConfig(list) {
    const labels = list.map(a => {
      const name = a.name || a.type;
      return a.brand ? `${name} — ${a.brand}` : name;
    });

    const barData = list.map(a => {
      const start = toYearDecimal(a.purchaseDate);
      const end = start + a.expectedLifespan;
      return [start, end];
    });

    const bgColors = list.map(a => {
      const { status } = getApplianceStatus(a);
      return STATUS_META[status].bar + 'BB';
    });

    const borderColors = list.map(a => {
      const { status } = getApplianceStatus(a);
      return STATUS_META[status].bar;
    });

    const allValues = list.flatMap(a => {
      const s = toYearDecimal(a.purchaseDate);
      return [s, s + a.expectedLifespan];
    });
    const minYear = Math.floor(Math.min(...allValues, currentYearDecimal)) - 0.5;
    const maxYear = Math.ceil(Math.max(...allValues, currentYearDecimal)) + 1.5;

    /** Custom plugin: draws a dashed "Today" vertical line */
    const todayLinePlugin = {
      id: 'todayLine',
      afterDraw(chartInst) {
        const { ctx, chartArea, scales } = chartInst;
        const xPos = scales.x.getPixelForValue(currentYearDecimal);
        if (xPos < chartArea.left || xPos > chartArea.right) return;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(xPos, chartArea.top);
        ctx.lineTo(xPos, chartArea.bottom);
        ctx.strokeStyle = 'rgba(30,41,59,0.65)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label pill
        const label = 'TODAY';
        ctx.font = 'bold 10px -apple-system, sans-serif';
        const tw = ctx.measureText(label).width;
        const px = xPos - tw / 2 - 5;
        const py = chartArea.top - 20;
        ctx.fillStyle = 'rgba(30,41,59,0.85)';
        ctx.beginPath();
        ctx.rect(px, py, tw + 10, 16);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, xPos, py + 8);
        ctx.restore();
      }
    };

    return {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Lifespan',
          data: barData,
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 1.5,
          borderRadius: 4,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 28, right: 12 } },
        scales: {
          x: {
            type: 'linear',
            min: minYear,
            max: maxYear,
            grid: { color: '#e2e8f0' },
            ticks: {
              stepSize: 1,
              callback: (v) => Number.isInteger(Math.round(v)) && Math.abs(v - Math.round(v)) < 0.01
                ? Math.round(v)
                : '',
              font: { size: 11 },
              color: '#64748b'
            },
            border: { color: '#cbd5e1' }
          },
          y: {
            grid: { display: false },
            ticks: { font: { size: 12 }, color: '#374151' },
            border: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: ([ctx]) => {
                const a = list[ctx.dataIndex];
                return a ? (a.name || a.type) : '';
              },
              label: (ctx) => {
                const a = list[ctx.dataIndex];
                if (!a) return '';
                const { ageYears, remainingYears } = getApplianceStatus(a);
                const lines = [
                  `  Type: ${a.type}`,
                  `  Age: ${ageYears.toFixed(1)} yrs`,
                ];
                if (remainingYears >= 0) {
                  lines.push(`  Remaining: ${remainingYears.toFixed(1)} yrs`);
                } else {
                  lines.push(`  Overdue by: ${Math.abs(remainingYears).toFixed(1)} yrs`);
                }
                if (a.replacementPlan?.estimatedCost) {
                  lines.push(`  Planned cost: $${a.replacementPlan.estimatedCost.toLocaleString()}`);
                }
                return lines;
              }
            }
          }
        }
      },
      plugins: [todayLinePlugin]
    };
  }

  function renderChart(list) {
    if (!ChartConstructor || !canvas) return;
    chart?.destroy();
    chart = null;
    if (list.length > 0) {
      chart = new ChartConstructor(canvas, buildConfig(list));
    }
  }

  onMount(async () => {
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);
    ChartConstructor = Chart;
  });

  // Recreate chart whenever ChartConstructor becomes available or appliances change
  $: ChartConstructor, appliances, (() => renderChart(appliances))();

  onDestroy(() => chart?.destroy());

  $: chartHeight = Math.max(180, appliances.length * 54 + 70);
</script>

<div class="timeline">
  {#if appliances.length === 0}
    <div class="empty">Add appliances above to see the timeline.</div>
  {:else}
    <div class="chart-wrap" style="height: {chartHeight}px">
      <canvas bind:this={canvas}></canvas>
    </div>
    <div class="legend">
      {#each Object.entries(STATUS_META) as [key, meta]}
        <span class="legend-item">
          <span class="dot" style="background:{meta.bar}"></span>
          {meta.label}
        </span>
      {/each}
    </div>
  {/if}
</div>

<style>
  .timeline { width: 100%; }

  .chart-wrap {
    position: relative;
    width: 100%;
  }

  .empty {
    text-align: center;
    padding: 3rem 1rem;
    color: #94a3b8;
    font-size: 0.9rem;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.25rem;
    padding: 0.75rem 0 0;
    justify-content: flex-end;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    color: #64748b;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }
</style>
