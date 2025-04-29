<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart, registerables } from 'chart.js';
  import type { ChartType } from 'chart.js';
  
  // Register Chart.js components
  Chart.register(...registerables);
  
  // Define report type
  type ReportType = 'daily' | 'weekly' | 'monthly' | 'custom';
  
  // Report data
  let selectedReportType: ReportType = 'daily';
  let selectedDateRange = 'last7days';
  let startDate = '';
  let endDate = '';
  let isGenerating = false;
  let reportGenerated = false;
  let chartInstance: Chart | null = null;
  
  // Sample report data
  const reportData: Record<ReportType, { 
    labels: string[]; 
    entries: number[]; 
    exits: number[] 
  }> = {
    daily: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      entries: [42, 51, 60, 45, 55, 75, 68],
      exits: [38, 46, 55, 42, 50, 68, 62]
    },
    weekly: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      entries: [320, 350, 380, 410],
      exits: [290, 320, 350, 380]
    },
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      entries: [1200, 1350, 1450, 1300, 1500, 1600],
      exits: [1100, 1250, 1350, 1200, 1400, 1500]
    },
    custom: {
      labels: [],
      entries: [],
      exits: []
    }
  };
  
  // Report type options
  const reportTypes = [
    { value: 'daily', label: 'Daily Report' },
    { value: 'weekly', label: 'Weekly Report' },
    { value: 'monthly', label: 'Monthly Report' },
    { value: 'custom', label: 'Custom Report' }
  ];
  
  // Date range options
  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' }
  ];
  
  // Initialize date inputs with current date range
  onMount(() => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    startDate = formatDate(sevenDaysAgo);
    endDate = formatDate(today);
    
    // Initialize report chart
    generateReport();
  });
  
  // Format date for input fields
  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Handle date range change
  function handleDateRangeChange() {
    const today = new Date();
    
    switch (selectedDateRange) {
      case 'today':
        startDate = formatDate(today);
        endDate = formatDate(today);
        break;
      case 'yesterday':
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        startDate = formatDate(yesterday);
        endDate = formatDate(yesterday);
        break;
      case 'last7days':
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        startDate = formatDate(sevenDaysAgo);
        endDate = formatDate(today);
        break;
      case 'last30days':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        startDate = formatDate(thirtyDaysAgo);
        endDate = formatDate(today);
        break;
      case 'thisMonth':
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = formatDate(firstDayOfMonth);
        endDate = formatDate(today);
        break;
      case 'lastMonth':
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        startDate = formatDate(firstDayOfLastMonth);
        endDate = formatDate(lastDayOfLastMonth);
        break;
      // For custom, keep the existing dates
    }
  }
  
  // Generate report
  function generateReport() {
    isGenerating = true;
    reportGenerated = false;
    
    // Simulate API call delay
    setTimeout(() => {
      isGenerating = false;
      reportGenerated = true;
      
      // Get the appropriate data based on report type
      const data = reportData[selectedReportType];
      
      // Create chart
      const ctx = document.getElementById('reportChart');
      if (ctx instanceof HTMLCanvasElement) {
        // Destroy previous chart if it exists
        if (chartInstance) {
          chartInstance.destroy();
        }
        
        chartInstance = new Chart(ctx, {
          type: 'bar' as ChartType,
          data: {
            labels: data.labels,
            datasets: [
              {
                label: 'Entries',
                data: data.entries,
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 1
              },
              {
                label: 'Exits',
                data: data.exits,
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  display: true,
                  color: 'rgba(0, 0, 0, 0.05)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            },
            plugins: {
              legend: {
                position: 'top'
              }
            }
          }
        });
      }
    }, 1000);
  }
  
  // Export report as CSV
  function exportCSV() {
    const data = reportData[selectedReportType];
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add header row
    csvContent += "Date,Entries,Exits,Net\n";
    
    // Add data rows
    data.labels.forEach((label: string, index: number) => {
      const entries = data.entries[index];
      const exits = data.exits[index];
      const net = entries - exits;
      csvContent += `${label},${entries},${exits},${net}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `simple_count_${selectedReportType}_report.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
  }
  
  // Export report as PDF
  function exportPDF() {
    alert('PDF export functionality would be implemented here.');
    // In a real implementation, you would use a library like jsPDF
    // to generate a PDF with the report data and charts
  }
</script>

<div class="reports-container">
  <h1>Reports</h1>
  
  <div class="report-controls">
    <div class="control-section">
      <h2>Report Configuration</h2>
      
      <div class="control-row">
        <div class="control-group">
          <label for="reportType">Report Type</label>
          <select id="reportType" bind:value={selectedReportType} class="select-input">
            {#each reportTypes as type}
              <option value={type.value}>{type.label}</option>
            {/each}
          </select>
        </div>
        
        <div class="control-group">
          <label for="dateRange">Date Range</label>
          <select id="dateRange" bind:value={selectedDateRange} on:change={handleDateRangeChange} class="select-input">
            {#each dateRanges as range}
              <option value={range.value}>{range.label}</option>
            {/each}
          </select>
        </div>
      </div>
      
      {#if selectedDateRange === 'custom'}
        <div class="control-row date-inputs">
          <div class="control-group">
            <label for="startDate">Start Date</label>
            <input type="date" id="startDate" bind:value={startDate} class="date-input">
          </div>
          
          <div class="control-group">
            <label for="endDate">End Date</label>
            <input type="date" id="endDate" bind:value={endDate} class="date-input">
          </div>
        </div>
      {/if}
      
      <div class="control-actions">
        <button class="btn btn-primary" on:click={generateReport} disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
    </div>
  </div>
  
  {#if reportGenerated}
    <div class="report-results">
      <div class="report-header">
        <h2>{reportTypes.find(t => t.value === selectedReportType)?.label || 'Report'}</h2>
        <div class="report-actions">
          <button class="btn btn-outline" on:click={exportCSV}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export CSV
          </button>
          <button class="btn btn-outline" on:click={exportPDF}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Export PDF
          </button>
        </div>
      </div>
      
      <div class="report-summary">
        <div class="summary-card">
          <div class="summary-title">Total Entries</div>
          <div class="summary-value">{reportData[selectedReportType].entries.reduce((a: number, b: number) => a + b, 0)}</div>
        </div>
        
        <div class="summary-card">
          <div class="summary-title">Total Exits</div>
          <div class="summary-value">{reportData[selectedReportType].exits.reduce((a: number, b: number) => a + b, 0)}</div>
        </div>
        
        <div class="summary-card">
          <div class="summary-title">Net Change</div>
          <div class="summary-value">
            {reportData[selectedReportType].entries.reduce((a: number, b: number) => a + b, 0) - 
             reportData[selectedReportType].exits.reduce((a: number, b: number) => a + b, 0)}
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-title">Average Daily Traffic</div>
          <div class="summary-value">
            {Math.round((reportData[selectedReportType].entries.reduce((a: number, b: number) => a + b, 0) + 
                        reportData[selectedReportType].exits.reduce((a: number, b: number) => a + b, 0)) / 
                        reportData[selectedReportType].labels.length)}
          </div>
        </div>
      </div>
      
      <div class="report-chart-container">
        <canvas id="reportChart"></canvas>
      </div>
      
      <div class="report-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Entries</th>
              <th>Exits</th>
              <th>Net Change</th>
            </tr>
          </thead>
          <tbody>
            {#each reportData[selectedReportType].labels as label, i}
              <tr>
                <td>{label}</td>
                <td>{reportData[selectedReportType].entries[i]}</td>
                <td>{reportData[selectedReportType].exits[i]}</td>
                <td>{reportData[selectedReportType].entries[i] - reportData[selectedReportType].exits[i]}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>

<style>
  .reports-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 0;
  }
  
  h1 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }
  
  h2 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    color: var(--accent-color);
  }
  
  .report-controls {
    background-color: var(--bg-secondary);
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px var(--shadow-color);
    margin-bottom: 2rem;
  }
  
  .control-row {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .control-group {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  
  .control-group label {
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
  }
  
  .select-input, .date-input {
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 0.875rem;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
  }
  
  .date-inputs {
    margin-top: 0.5rem;
  }
  
  .control-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    border: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .btn-primary {
    background-color: var(--accent-color);
    color: white;
  }
  
  .btn-primary:hover {
    background-color: var(--accent-hover);
  }
  
  .btn-primary:disabled {
    background-color: var(--accent-color);
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .btn-outline {
    background-color: var(--bg-secondary);
    color: var(--accent-color);
    border: 1px solid var(--accent-color);
  }
  
  .btn-outline:hover {
    background-color: var(--bg-primary);
  }
  
  .report-results {
    background-color: var(--bg-secondary);
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px var(--shadow-color);
  }
  
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .report-actions {
    display: flex;
    gap: 0.75rem;
  }
  
  .report-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  
  .summary-card {
    background-color: var(--bg-primary);
    padding: 1rem;
    border-radius: 6px;
    text-align: center;
  }
  
  .summary-title {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }
  
  .summary-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--text-primary);
  }
  
  .report-chart-container {
    height: 400px;
    margin-bottom: 2rem;
  }
  
  .report-table {
    overflow-x: auto;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  th {
    font-weight: 500;
    color: var(--text-secondary);
    background-color: var(--bg-primary);
  }
  
  tr:last-child td {
    border-bottom: none;
  }
</style> 