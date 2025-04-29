<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart, registerables } from 'chart.js';
  import { goto } from '$app/navigation';
  
  // Register Chart.js components
  Chart.register(...registerables);
  
  // Custom plugin for vertical line on hover
  const verticalLinePlugin = {
    id: 'verticalLine',
    beforeDraw: (chart: any) => {
      if (chart.tooltip?._active?.length) {
        const activePoint = chart.tooltip._active[0];
        const { ctx } = chart;
        const { x } = activePoint.element;
        const topY = chart.scales.y.top;
        const bottomY = chart.scales.y.bottom;
        
        // Draw vertical line
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);
        ctx.lineWidth = 1;
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
        ctx.stroke();
        ctx.restore();
      }
    }
  };
  
  // Analytics data
  let currentCount = 15;
  let entries = 50;
  let exits = 35;
  let weeklyEntries = 1030;
  
  // Time series data for people count - simplified for analytics overview
  const timeLabels = ['8:00','10:00', '12:00', '2:00', '4:00', '6:00', '8:00'];
  const timeData = [153, 150, 160, 200, 160, 180, 150];
  
  // Weekly data
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekData = [120, 150, 130, 160, 170, 200, 180];
  
  let timeChart;
  let weeklyChart;
  
  // Function to navigate to the detailed dashboard
  function goToDashboard() {
    goto('/dashboard');
  }
  
  onMount(() => {
    // Get CSS variables for chart colors
    const style = getComputedStyle(document.documentElement);
    const gridColor = style.getPropertyValue('--chart-grid');
    const bgColor = style.getPropertyValue('--bg-secondary');
    const textColor = style.getPropertyValue('--text-secondary');
    const borderColor = style.getPropertyValue('--border-color');
    
    // Create time series chart - simplified for analytics overview
    const timeCtx = document.getElementById('timeChart');
    if (timeCtx instanceof HTMLCanvasElement) {
      timeChart = new Chart(timeCtx, {
        type: 'line',
        data: {
          labels: timeLabels,
          datasets: [{
            label: 'People Count',
            data: timeData,
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: bgColor,
            pointBorderColor: 'rgb(99, 102, 241)',
            pointBorderWidth: 2,
            borderWidth: 2,
            fill: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: false
              },
              border: {
                display: true,
                color: borderColor
              },
              ticks: {
                display: true,
                color: textColor
              }
            },
            x: {
              grid: {
                display: false
              },
              border: {
                display: true,
                color: borderColor
              },
              ticks: {
                display: true,
                color: textColor
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: bgColor,
              titleColor: textColor,
              bodyColor: textColor,
              borderColor: borderColor,
              borderWidth: 1,
              padding: 10,
              cornerRadius: 4,
              displayColors: false
            }
          },
          interaction: {
            mode: 'index',
            intersect: false
          },
          hover: {
            mode: 'index',
            intersect: false
          }
        },
        plugins: [verticalLinePlugin]
      });
    }
    
    // Create weekly chart - simplified for analytics overview
    const weeklyCtx = document.getElementById('weeklyChart');
    if (weeklyCtx instanceof HTMLCanvasElement) {
      weeklyChart = new Chart(weeklyCtx, {
        type: 'bar',
        data: {
          labels: weekLabels,
          datasets: [{
            label: 'Weekly Entries',
            data: weekData,
            backgroundColor: 'rgba(34, 197, 94, 0.6)',
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: false
              },
              border: {
                display: true,
                color: borderColor
              },
              ticks: {
                display: true,
                color: textColor
              }
            },
            x: {
              grid: {
                display: false
              },
              border: {
                display: true,
                color: borderColor
              },
              ticks: {
                display: true,
                color: textColor
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: bgColor,
              titleColor: textColor,
              bodyColor: textColor,
              borderColor: borderColor,
              borderWidth: 1,
              padding: 10,
              cornerRadius: 4,
              displayColors: false
            }
          }
        }
      });
    }
  });
</script>

<div class="analytics-container">
  <div class="header-section">
    <h1>People Counter Analytics</h1>
    <button class="btn-dashboard" on:click={goToDashboard}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="9"></rect>
        <rect x="14" y="3" width="7" height="5"></rect>
        <rect x="14" y="12" width="7" height="9"></rect>
        <rect x="3" y="16" width="7" height="5"></rect>
      </svg>
      View Dashboard
    </button>
  </div>
  
  <div class="overview-section">
    <div class="overview-card">
      <h2>Analytics Overview</h2>
      <p class="overview-text">
        Track and analyze visitor traffic patterns over time. Use the dashboard for real-time monitoring 
        and detailed analytics. Below is a summary of current metrics.
      </p>
      
      <div class="stats-mini">
        <div class="stat-mini">
          <span class="stat-mini-label">Current Count</span>
          <span class="stat-mini-value">{currentCount}</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-label">Today's Entries</span>
          <span class="stat-mini-value">{entries}</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-label">Today's Exits</span>
          <span class="stat-mini-value">{exits}</span>
        </div>
        <div class="stat-mini">
          <span class="stat-mini-label">Weekly Total</span>
          <span class="stat-mini-value">{weeklyEntries}</span>
        </div>
      </div>
    </div>
  </div>
  
  <div class="analytics-grid">
    <div class="analytics-card">
      <h2>Today's Traffic Pattern</h2>
      <div class="chart-container">
        <canvas id="timeChart"></canvas>
      </div>
      <div class="card-footer">
        <button class="btn-link" on:click={goToDashboard}>
          View detailed data
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="analytics-card">
      <h2>Weekly Traffic Analysis</h2>
      <div class="chart-container">
        <canvas id="weeklyChart"></canvas>
      </div>
      <div class="card-footer">
        <button class="btn-link" on:click={goToDashboard}>
          View detailed data
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
  
  <div class="actions-card">
    <h2>Analysis Actions</h2>
    <div class="actions-grid">
      <button class="action-btn" on:click={goToDashboard}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="9"></rect>
          <rect x="14" y="3" width="7" height="5"></rect>
          <rect x="14" y="12" width="7" height="9"></rect>
          <rect x="3" y="16" width="7" height="5"></rect>
        </svg>
        Dashboard
      </button>
      <a href="/reports" class="action-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        Reports
      </a>
      <a href="/settings" class="action-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        Settings
      </a>
    </div>
  </div>
</div>

<style>
  .analytics-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  h1 {
    font-size: 1.8rem;
    margin: 0;
  }
  
  h2 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
  
  .btn-dashboard {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--accent-color);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .btn-dashboard:hover {
    background-color: var(--accent-hover);
  }
  
  .overview-section {
    margin-bottom: 2rem;
  }
  
  .overview-card {
    background-color: var(--bg-secondary);
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px var(--shadow-color);
  }
  
  .overview-text {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }
  
  .stats-mini {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }
  
  .stat-mini {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem;
    background-color: var(--bg-primary);
    border-radius: 6px;
  }
  
  .stat-mini-label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
  }
  
  .stat-mini-value {
    font-size: 1.25rem;
    font-weight: bold;
    color: var(--text-primary);
  }
  
  .analytics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .analytics-card {
    background-color: var(--bg-secondary);
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px var(--shadow-color);
  }
  
  .chart-container {
    height: 250px;
    position: relative;
    margin-bottom: 1rem;
  }
  
  .card-footer {
    display: flex;
    justify-content: flex-end;
  }
  
  .btn-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--accent-color);
    font-weight: 500;
    cursor: pointer;
    padding: 0;
  }
  
  .btn-link:hover {
    text-decoration: underline;
  }
  
  .actions-card {
    background-color: var(--bg-secondary);
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px var(--shadow-color);
  }
  
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background-color: var(--bg-primary);
    border: none;
    border-radius: 6px;
    color: var(--text-primary);
    text-decoration: none;
    cursor: pointer;
    transition: transform 0.2s, background-color 0.2s;
  }
  
  .action-btn svg {
    color: var(--accent-color);
  }
  
  .action-btn:hover {
    transform: translateY(-2px);
    background-color: var(--bg-hover);
  }
  
  @media (max-width: 768px) {
    .header-section {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    
    .btn-dashboard {
      width: 100%;
      justify-content: center;
    }
    
    .actions-grid {
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    }
  }
</style>
