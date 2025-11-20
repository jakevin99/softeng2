<script lang="ts">
  import { onMount } from 'svelte';
  import { config } from '$lib/config'; // Assuming a config  file for base URL
  // Import Chart.js by adding a comment that it needs to be added to package.json
  // Add: npm install chart.js --save

  // Types for our analytics data
  interface DailyBreakdownItem {
    date: string;
    entries: number;
    exits: number;
  }

  interface HourlyBreakdownItem {
    hour: number;
    entries: number;
    exits: number;
  }

  interface PeakDay {
    date: string;
    entries: number;
    exits: number;
  }
  // Define Chart type for TypeScript
  interface Window {
    Chart: any;
  }
  
  interface AnalyticsData {
    description: string;
    interval: 'daily' | 'weekly' | 'monthly';
    total_entries: number;
    total_exits: number;
    average_daily_entries?: number;
    average_daily_exits?: number;
    peak_day?: PeakDay | null;
    daily_breakdown?: DailyBreakdownItem[];
    hourly_breakdown?: HourlyBreakdownItem[];
    range?: {
      startDate: string;
      endDate: string;
    };
  }

  let selectedInterval: 'daily' | 'weekly' | 'monthly' = 'daily';
  let analyticsData: AnalyticsData | null = null;
  let isLoading = false;
  let error: string | null = null;
  
  // Chart references
  let trafficChart: any;
  let hourlyChart: any;
  let heatmapCanvas: HTMLCanvasElement;
  let selectedDateHeatmapCanvas: HTMLCanvasElement;
  let weeklyDistributionChart: any;
  let monthlyDistributionChart: any;

  // State for selected date heatmap
  let selectedDate: string | null = null;
  let selectedDateHourlyData: HourlyBreakdownItem[] | null = null;
  let isLoadingDateData = false;
  let dateDataError: string | null = null;

  // Function to fetch analytics data from the backend
  async function fetchAnalyticsData(interval: 'daily' | 'weekly' | 'monthly') {
    isLoading = true;
    error = null;
    analyticsData = null;
    // Reset selected date when interval changes
    selectedDate = null;
    selectedDateHourlyData = null;
    
    let url = `${config.baseUrl}/api/counters/analytics/summary`;
    const params = new URLSearchParams();
    params.append('interval', interval);
    
    url += `?${params.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        analyticsData = data.data;
        
        // After data is loaded, create or update charts
        setTimeout(() => {
          createOrUpdateCharts();
          if (analyticsData?.hourly_breakdown?.length) {
            createHeatmap();
          }
        }, 100);
      } else {
        throw new Error(data.message || 'Failed to fetch analytics data');
      }
    } catch (e: any) {
      console.error('Error fetching analytics data:', e);
      error = e.message || 'An unexpected error occurred.';
    } finally {
      isLoading = false;
    }
  }

  // Function to fetch hourly data for a specific date
  async function fetchHourlyDataForDate(date: string) {
    isLoadingDateData = true;
    dateDataError = null;
    selectedDateHourlyData = null;
    
    let url = `${config.baseUrl}/api/counters/analytics/hourly-by-date`;
    const params = new URLSearchParams();
    params.append('date', date);
    
    url += `?${params.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        selectedDateHourlyData = data.data.hourly_breakdown;
        
        // After data is loaded, create heatmap for selected date
        setTimeout(() => {
          if (selectedDateHourlyData?.length) {
            createSelectedDateHeatmap();
          }
        }, 100);
      } else {
        throw new Error(data.message || 'Failed to fetch hourly data for date');
      }
    } catch (e: any) {
      console.error('Error fetching hourly data for date:', e);
      dateDataError = e.message || 'An unexpected error occurred.';
    } finally {
      isLoadingDateData = false;
    }
  }

  // Function to handle clicking on a date in the daily breakdown table
  function handleDateClick(date: string) {
    // If already selected, deselect
    if (selectedDate === date) {
      selectedDate = null;
      selectedDateHourlyData = null;
      return;
    }

    selectedDate = date;
    fetchHourlyDataForDate(date);
  }

  // Fetch data when the component mounts or interval changes
  onMount(() => {
    fetchAnalyticsData(selectedInterval);
    // We need to import and set up Chart.js in a real implementation
    // This is a placeholder comment indicating we would do so
    // import Chart from 'chart.js/auto';
  });

  function handleIntervalChange(newInterval: 'daily' | 'weekly' | 'monthly') {
    selectedInterval = newInterval;
    fetchAnalyticsData(selectedInterval);
  }
  
  // Helper to format numbers
  function formatNumber(num: number | undefined): string {
    return num !== undefined ? num.toLocaleString() : 'N/A';
  }
  
  // Helper to calculate net flow (entries - exits)
  function calculateNetFlow(entries: number, exits: number): number {
    return entries - exits;
  }

  // Simulated function to create or update charts (in a real implementation, this would use Chart.js)
  function createOrUpdateCharts() {
    if (!analyticsData) return;
    
    // In a real implementation, this is where we would create/update Chart.js instances
    console.log('Charts would be created/updated here with the data:', analyticsData);
    
    // For demonstration purposes only - in production use actual Chart.js
    if (typeof window !== 'undefined' && typeof (window as any).Chart !== 'undefined') {
      // Get computed styles for chart colors to ensure proper light/dark mode support
      const computedStyle = getComputedStyle(document.documentElement);
      const textColor = computedStyle.getPropertyValue('--text-primary').trim() || '#1f2937';
      const borderColor = computedStyle.getPropertyValue('--border-color').trim() || '#e5e7eb';
      const bgColor = computedStyle.getPropertyValue('--bg-secondary').trim() || '#ffffff';
      const entryColor = computedStyle.getPropertyValue('--entry-color').trim() || '#10b981';
      const exitColor = computedStyle.getPropertyValue('--exit-color').trim() || '#ef4444';
      const gridColor = computedStyle.getPropertyValue('--chart-grid').trim() || 'rgba(0, 0, 0, 0.05)';
      
      // Traffic comparison chart (entries vs exits)
      const dailyData = analyticsData.daily_breakdown || [];
      
      if (trafficChart) {
        trafficChart.destroy();
      }
      
      // Get the canvas element for the traffic chart
      const ctx = document.getElementById('trafficChart') as HTMLCanvasElement;
      if (ctx) {
        // For daily view, keep the bar chart
        // For weekly and monthly, convert to line chart similar to hourly distribution
        if (selectedInterval === 'daily') {
          trafficChart = new (window as any).Chart(ctx, {
            type: 'bar',
            data: {
              labels: dailyData.map(d => d.date),
              datasets: [
                {
                  label: 'Entries',
                  data: dailyData.map(d => d.entries),
                  backgroundColor: `${entryColor}80`, // 50% opacity
                  borderColor: entryColor,
                  borderWidth: 1
                },
                {
                  label: 'Exits',
                  data: dailyData.map(d => d.exits),
                  backgroundColor: `${exitColor}80`, // 50% opacity
                  borderColor: exitColor,
                  borderWidth: 1
                }
              ]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  labels: {
                    color: textColor
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: gridColor
                  },
                  ticks: {
                    color: textColor
                  }
                },
                x: {
                  grid: {
                    color: gridColor
                  },
                  ticks: {
                    color: textColor
                  }
                }
              }
            }
          });
        } else {
          // Weekly or Monthly: Line chart (similar to hourly distribution)
          trafficChart = new (window as any).Chart(ctx, {
            type: 'line',
            data: {
              labels: dailyData.map(d => d.date),
              datasets: [
                {
                  label: 'Entries',
                  data: dailyData.map(d => d.entries),
                  borderColor: entryColor,
                  backgroundColor: `${entryColor}20`, // 12.5% opacity
                  tension: 0.3,
                  fill: true,
                  borderWidth: 2 // Increase line thickness
                },
                {
                  label: 'Exits',
                  data: dailyData.map(d => d.exits),
                  borderColor: exitColor,
                  backgroundColor: `${exitColor}20`, // 12.5% opacity
                  tension: 0.3,
                  fill: true,
                  borderWidth: 2 // Increase line thickness
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              layout: {
                padding: {
                  left: 0,
                  right: 0,
                  top: 10,
                  bottom: 10
                }
              },
              plugins: {
                legend: {
                  labels: {
                    color: textColor,
                    font: {
                      size: 14 // Larger legend font
                    }
                  },
                  position: 'top'
                },
                title: {
                  display: true,
                  text: selectedInterval === 'weekly' ? 'Weekly Traffic Distribution' : 'Monthly Traffic Distribution',
                  color: textColor,
                  font: {
                    size: 18 // Larger title font
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: gridColor
                  },
                  ticks: {
                    color: textColor,
                    font: {
                      size: 12 // Larger tick font
                    }
                  }
                },
                x: {
                  grid: {
                    color: gridColor
                  },
                  ticks: {
                    color: textColor,
                    maxRotation: 45,
                    minRotation: 45,
                    font: {
                      size: 12 // Larger tick font
                    }
                  }
                }
              }
            }
          });
        }
      }
      
      // Hourly distribution chart
      if (analyticsData.hourly_breakdown && analyticsData.hourly_breakdown.length) {
        if (hourlyChart) {
          hourlyChart.destroy();
        }
        
        const hourlyCtx = document.getElementById('hourlyChart') as HTMLCanvasElement;
        if (hourlyCtx) {
          hourlyChart = new (window as any).Chart(hourlyCtx, {
            type: 'line',
            data: {
              labels: analyticsData.hourly_breakdown.map(h => `${h.hour}:00`),
              datasets: [
                {
                  label: 'Entries',
                  data: analyticsData.hourly_breakdown.map(h => h.entries),
                  borderColor: entryColor,
                  backgroundColor: `${entryColor}20`, // 12.5% opacity
                  tension: 0.3,
                  fill: true
                },
                {
                  label: 'Exits',
                  data: analyticsData.hourly_breakdown.map(h => h.exits),
                  borderColor: exitColor,
                  backgroundColor: `${exitColor}20`, // 12.5% opacity
                  tension: 0.3,
                  fill: true
                }
              ]
            },
            options: {
              responsive: true,
              plugins: {
                legend: {
                  labels: {
                    color: textColor
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: gridColor
                  },
                  ticks: {
                    color: textColor
                  }
                },
                x: {
                  grid: {
                    color: gridColor
                  },
                  ticks: {
                    color: textColor
                  }
                }
              }
            }
          });
        }
      }
      
      // Weekly distribution chart (when weekly interval is selected)
      if (selectedInterval === 'weekly' && dailyData.length) {
        if (weeklyDistributionChart) {
          weeklyDistributionChart.destroy();
        }
        
        const weeklyCtx = document.getElementById('weeklyDistributionChart') as HTMLCanvasElement;
        if (weeklyCtx) {
          // Process data for weekly distribution (by day of week)
          const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const weeklyData = daysOfWeek.map(day => {
            // Filter daily data by day of week
            const dayEntries = dailyData
              .filter(d => {
                const date = new Date(d.date);
                return daysOfWeek[date.getDay()] === day;
              })
              .reduce((sum, d) => sum + d.entries, 0);
              
            const dayExits = dailyData
              .filter(d => {
                const date = new Date(d.date);
                return daysOfWeek[date.getDay()] === day;
              })
              .reduce((sum, d) => sum + d.exits, 0);
              
            return { day, entries: dayEntries, exits: dayExits };
          });
          
          weeklyDistributionChart = new (window as any).Chart(weeklyCtx, {
            type: 'bar',
            data: {
              labels: weeklyData.map(d => d.day),
              datasets: [
                {
                  label: 'Entries',
                  data: weeklyData.map(d => d.entries),
                  backgroundColor: `${entryColor}80`, // 50% opacity
                  borderColor: entryColor,
                  borderWidth: 1
                },
                {
                  label: 'Exits',
                  data: weeklyData.map(d => d.exits),
                  backgroundColor: `${exitColor}80`, // 50% opacity
                  borderColor: exitColor,
                  borderWidth: 1
                }
              ]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Traffic Distribution by Day of Week',
                  color: textColor
                },
                legend: {
                  labels: {
                    color: textColor
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: gridColor
                  },
                  ticks: {
                    color: textColor
                  }
                },
                x: {
                  grid: {
                    color: gridColor
                  },
                  ticks: {
                    color: textColor
                  }
                }
              }
            }
          });
        }
      }
      
      // Monthly distribution chart (when monthly interval is selected)
      if (selectedInterval === 'monthly' && dailyData.length) {
        if (monthlyDistributionChart) {
          monthlyDistributionChart.destroy();
        }
        
        const monthlyCtx = document.getElementById('monthlyDistributionChart') as HTMLCanvasElement;
        if (monthlyCtx) {
          // Process data for monthly distribution (by week of month)
          // Group days into weeks (1-7, 8-14, 15-21, 22-28, 29+)
          const weeks = ['Week 1 (1-7)', 'Week 2 (8-14)', 'Week 3 (15-21)', 'Week 4 (22-28)', 'Week 5 (29+)'];
          const monthlyData = weeks.map((week, index) => {
            // Determine day range for this week
            const startDay = index * 7 + 1;
            const endDay = index === 4 ? 31 : startDay + 6;
            
            // Filter daily data by day of month
            const weekEntries = dailyData
              .filter(d => {
                const date = new Date(d.date);
                const dayOfMonth = date.getDate();
                return dayOfMonth >= startDay && dayOfMonth <= endDay;
              })
              .reduce((sum, d) => sum + d.entries, 0);
              
            const weekExits = dailyData
              .filter(d => {
                const date = new Date(d.date);
                const dayOfMonth = date.getDate();
                return dayOfMonth >= startDay && dayOfMonth <= endDay;
              })
              .reduce((sum, d) => sum + d.exits, 0);
              
            return { week, entries: weekEntries, exits: weekExits };
          });
          
          monthlyDistributionChart = new (window as any).Chart(monthlyCtx, {
            type: 'bar',
            data: {
              labels: monthlyData.map(d => d.week),
              datasets: [
                {
                  label: 'Entries',
                  data: monthlyData.map(d => d.entries),
                  backgroundColor: `${entryColor}80`, // 50% opacity
                  borderColor: entryColor,
                  borderWidth: 1
                },
                {
                  label: 'Exits',
                  data: monthlyData.map(d => d.exits),
                  backgroundColor: `${exitColor}80`, // 50% opacity
                  borderColor: exitColor,
                  borderWidth: 1
                }
              ]
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Traffic Distribution by Week of Month',
                  color: textColor
                },
                legend: {
                  labels: {
                    color: textColor
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: gridColor
                  },
                  ticks: {
                    color: textColor
                  }
                },
                x: {
                  grid: {
                    color: gridColor
                  },
                  ticks: {
                    color: textColor
                  }
                }
              }
            }
          });
        }
      }
    }
  }
  
  // Function to create a simple heatmap visualization
  function createHeatmap() {
    if (!analyticsData?.hourly_breakdown?.length || !heatmapCanvas) return;
    
    const ctx = heatmapCanvas.getContext('2d');
    if (!ctx) return;
    
    const hourlyData = analyticsData.hourly_breakdown;
    const width = heatmapCanvas.width;
    const height = heatmapCanvas.height;
    const cellWidth = width / 24; // 24 hours
    const maxValue = Math.max(...hourlyData.map(h => Math.max(h.entries, h.exits)));
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Get computed styles for better light/dark mode support
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue('--bg-primary').trim() || '#f9fafb';
    const textColor = computedStyle.getPropertyValue('--text-primary').trim() || '#1f2937';
    const borderColor = computedStyle.getPropertyValue('--border-color').trim() || '#e5e7eb';
    
    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    
    // Vertical grid lines (hours)
    for (let h = 0; h <= 24; h++) {
      ctx.beginPath();
      ctx.moveTo(h * cellWidth, 0);
      ctx.lineTo(h * cellWidth, height);
      ctx.stroke();
    }
    
    // Horizontal grid line (separating entries and exits)
    ctx.beginPath();
    ctx.moveTo(0, height/2);
    ctx.lineTo(width, height/2);
    ctx.stroke();
    
    // Horizontal grid lines (additional visual guides)
    ctx.strokeStyle = borderColor;
    ctx.beginPath();
    ctx.moveTo(0, height/4);
    ctx.lineTo(width, height/4);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, height*3/4);
    ctx.lineTo(width, height*3/4);
    ctx.stroke();
    
    // Draw heatmap cells with improved visual clarity
    hourlyData.forEach(hourData => {
      const hour = hourData.hour;
      const intensity = hourData.entries / (maxValue || 1); // Avoid division by zero
      
      // Calculate color based on intensity (green to red)
      // Using a more vibrant color palette
      const r = intensity === 0 ? 0 : Math.floor(200 + 55 * intensity); // Make zero values pure green
      const g = Math.floor(250 * (1 - intensity)); // Stronger green transition
      const b = 0;
      
      // Add cell border for better definition
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      // Reduce size slightly to create visual separation between cells
      ctx.fillRect(hour * cellWidth + 1, 2, cellWidth - 2, height/2 - 4);
      
      // Draw a subtle border around the cell
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(hour * cellWidth + 1, 2, cellWidth - 2, height/2 - 4);
      
      // For exits
      const exitIntensity = hourData.exits / (maxValue || 1);
      const exitR = exitIntensity === 0 ? 0 : Math.floor(200 + 55 * exitIntensity);
      const exitG = Math.floor(250 * (1 - exitIntensity));
      
      ctx.fillStyle = `rgb(${exitR}, ${exitG}, ${b})`;
      ctx.fillRect(hour * cellWidth + 1, height/2 + 2, cellWidth - 2, height/2 - 4);
      
      // Exit cell border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.strokeRect(hour * cellWidth + 1, height/2 + 2, cellWidth - 2, height/2 - 4);
      
      // Add data value labels for ALL cells, regardless of intensity
      // Adjust text color based on background intensity for better readability
      // Use black text for medium intensity (yellow-green) for better visibility
      if (intensity > 0.7) {
        ctx.fillStyle = 'white'; // White text on red (high intensity)
      } else if (intensity > 0.4) {
        ctx.fillStyle = 'black'; // Black text on yellow-green (medium intensity)
      } else {
        ctx.fillStyle = 'black'; // Black text on green (low intensity)
      }
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(hourData.entries.toString(), hour * cellWidth + cellWidth/2, height/4 + 4);
      
      // For exits - always show values with improved visibility
      if (exitIntensity > 0.7) {
        ctx.fillStyle = 'white'; // White text on red (high intensity)
      } else if (exitIntensity > 0.4) {
        ctx.fillStyle = 'black'; // Black text on yellow-green (medium intensity)
      } else {
        ctx.fillStyle = 'black'; // Black text on green (low intensity)
      }
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(hourData.exits.toString(), hour * cellWidth + cellWidth/2, height*3/4 + 4);
    });
    
    // Add labels
    ctx.fillStyle = textColor;
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    
    // Add hour labels with improved visibility
    for (let h = 0; h < 24; h += 2) {
      // Add background for better text visibility
      const timeText = `${h}:00`;
      const textWidth = ctx.measureText(timeText).width;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black background
      ctx.fillRect(h * cellWidth + (cellWidth/2) - (textWidth/2) - 2, height - 15, textWidth + 4, 12);
      
      // Draw text
      ctx.fillStyle = 'white'; // White text for better visibility on dark background
      ctx.fillText(timeText, h * cellWidth + cellWidth/2, height - 4);
    }
    
    // Add section labels
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Entries', 10, 15);
    ctx.fillText('Exits', 10, height/2 + 15);
    
    // Add color legend
    const legendWidth = 120;
    const legendHeight = 15;
    const legendX = width - legendWidth - 10;
    const legendY = 10;
    
    // Draw gradient background for legend
    const gradient = ctx.createLinearGradient(legendX, 0, legendX + legendWidth, 0);
    gradient.addColorStop(0, 'rgb(0, 250, 0)'); // Pure green for zero/low values
    gradient.addColorStop(0.5, 'rgb(255, 255, 0)');
    gradient.addColorStop(1, 'rgb(255, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
    
    // Add border to legend
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);
    
    // Add legend labels
    ctx.fillStyle = textColor;
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Low', legendX + 10, legendY + legendHeight + 10);
    ctx.fillText('Medium', legendX + legendWidth/2, legendY + legendHeight + 10);
    ctx.fillText('High', legendX + legendWidth - 10, legendY + legendHeight + 10);
  }

  // Function to create a heatmap for the selected date
  function createSelectedDateHeatmap() {
    if (!selectedDateHourlyData?.length || !selectedDateHeatmapCanvas) return;
    
    const ctx = selectedDateHeatmapCanvas.getContext('2d');
    if (!ctx) return;
    
    const hourlyData = selectedDateHourlyData;
    const width = selectedDateHeatmapCanvas.width;
    const height = selectedDateHeatmapCanvas.height;
    const cellWidth = width / 24; // 24 hours
    const maxValue = Math.max(...hourlyData.map(h => Math.max(h.entries, h.exits)));
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Get computed styles for better light/dark mode support
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue('--bg-primary').trim() || '#f9fafb';
    const textColor = computedStyle.getPropertyValue('--text-primary').trim() || '#1f2937';
    const borderColor = computedStyle.getPropertyValue('--border-color').trim() || '#e5e7eb';
    
    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    
    // Vertical grid lines (hours)
    for (let h = 0; h <= 24; h++) {
      ctx.beginPath();
      ctx.moveTo(h * cellWidth, 0);
      ctx.lineTo(h * cellWidth, height);
      ctx.stroke();
    }
    
    // Horizontal grid line (separating entries and exits)
    ctx.beginPath();
    ctx.moveTo(0, height/2);
    ctx.lineTo(width, height/2);
    ctx.stroke();
    
    // Horizontal grid lines (additional visual guides)
    ctx.strokeStyle = borderColor;
    ctx.beginPath();
    ctx.moveTo(0, height/4);
    ctx.lineTo(width, height/4);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, height*3/4);
    ctx.lineTo(width, height*3/4);
    ctx.stroke();
    
    // Draw heatmap cells with improved visual clarity
    hourlyData.forEach(hourData => {
      const hour = hourData.hour;
      const intensity = hourData.entries / (maxValue || 1); // Avoid division by zero
      
      // Calculate color based on intensity (green to red)
      // Using a more vibrant color palette
      const r = intensity === 0 ? 0 : Math.floor(200 + 55 * intensity); // Make zero values pure green
      const g = Math.floor(250 * (1 - intensity)); // Stronger green transition
      const b = 0;
      
      // Add cell border for better definition
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      // Reduce size slightly to create visual separation between cells
      ctx.fillRect(hour * cellWidth + 1, 2, cellWidth - 2, height/2 - 4);
      
      // Draw a subtle border around the cell
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(hour * cellWidth + 1, 2, cellWidth - 2, height/2 - 4);
      
      // For exits
      const exitIntensity = hourData.exits / (maxValue || 1);
      const exitR = exitIntensity === 0 ? 0 : Math.floor(200 + 55 * exitIntensity);
      const exitG = Math.floor(250 * (1 - exitIntensity));
      
      ctx.fillStyle = `rgb(${exitR}, ${exitG}, ${b})`;
      ctx.fillRect(hour * cellWidth + 1, height/2 + 2, cellWidth - 2, height/2 - 4);
      
      // Exit cell border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.strokeRect(hour * cellWidth + 1, height/2 + 2, cellWidth - 2, height/2 - 4);
      
      // Add data value labels for ALL cells, regardless of intensity
      // Adjust text color based on background intensity for better readability
      // Use black text for medium intensity (yellow-green) for better visibility
      if (intensity > 0.7) {
        ctx.fillStyle = 'white'; // White text on red (high intensity)
      } else if (intensity > 0.4) {
        ctx.fillStyle = 'black'; // Black text on yellow-green (medium intensity)
      } else {
        ctx.fillStyle = 'black'; // Black text on green (low intensity)
      }
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(hourData.entries.toString(), hour * cellWidth + cellWidth/2, height/4 + 4);
      
      // For exits - always show values with improved visibility
      if (exitIntensity > 0.7) {
        ctx.fillStyle = 'white'; // White text on red (high intensity)
      } else if (exitIntensity > 0.4) {
        ctx.fillStyle = 'black'; // Black text on yellow-green (medium intensity)
      } else {
        ctx.fillStyle = 'black'; // Black text on green (low intensity)
      }
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(hourData.exits.toString(), hour * cellWidth + cellWidth/2, height*3/4 + 4);
    });
    
    // Add labels
    ctx.fillStyle = textColor;
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    
    // Add hour labels with improved visibility
    for (let h = 0; h < 24; h += 2) {
      // Add background for better text visibility
      const timeText = `${h}:00`;
      const textWidth = ctx.measureText(timeText).width;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black background
      ctx.fillRect(h * cellWidth + (cellWidth/2) - (textWidth/2) - 2, height - 15, textWidth + 4, 12);
      
      // Draw text
      ctx.fillStyle = 'white'; // White text for better visibility on dark background
      ctx.fillText(timeText, h * cellWidth + cellWidth/2, height - 4);
    }
    
    // Add section labels
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Entries', 10, 15);
    ctx.fillText('Exits', 10, height/2 + 15);
    
    // Add color legend
    const legendWidth = 120;
    const legendHeight = 15;
    const legendX = width - legendWidth - 10;
    const legendY = 10;
    
    // Draw gradient background for legend
    const gradient = ctx.createLinearGradient(legendX, 0, legendX + legendWidth, 0);
    gradient.addColorStop(0, 'rgb(0, 250, 0)'); // Pure green for zero/low values
    gradient.addColorStop(0.5, 'rgb(255, 255, 0)');
    gradient.addColorStop(1, 'rgb(255, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
    
    // Add border to legend
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);
    
    // Add legend labels
    ctx.fillStyle = textColor;
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Low', legendX + 10, legendY + legendHeight + 10);
    ctx.fillText('Medium', legendX + legendWidth/2, legendY + legendHeight + 10);
    ctx.fillText('High', legendX + legendWidth - 10, legendY + legendHeight + 10);
  }
</script>

<svelte:head>
  <title>Analytics Dashboard</title>
  <!-- In a real implementation, we would add Chart.js CDN or reference from node_modules -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</svelte:head>

<div class="analytics-container">
  <h1>Analytics Dashboard</h1>

  <div class="controls">
    <div class="interval-selector">
      <button class:active={selectedInterval === 'daily'} on:click={() => handleIntervalChange('daily')}>Daily</button>
      <button class:active={selectedInterval === 'weekly'} on:click={() => handleIntervalChange('weekly')}>Weekly</button>
      <button class:active={selectedInterval === 'monthly'} on:click={() => handleIntervalChange('monthly')}>Monthly</button>
    </div>
  </div>

  {#if isLoading}
    <div class="loading-container">
      <div class="loader"></div>
      <p class="loading-message">Loading analytics data...</p>
    </div>
  {:else if error}
    <p class="error-message">Error: {error}</p>
    <button on:click={() => fetchAnalyticsData(selectedInterval)} disabled={isLoading}>Retry</button>
  {:else if analyticsData}
    <div class="dashboard-content">
      <!-- Summary Cards Section -->
      <section class="summary-section">
        <h2>{analyticsData.description}</h2>
        {#if analyticsData.range}
          <p class="date-range"><strong>Range:</strong> {analyticsData.range.startDate} to {analyticsData.range.endDate}</p>
        {/if}
        
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon entry-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
            <div class="metric-content">
              <span class="metric-label">Total Entries</span>
              <span class="metric-value">{formatNumber(analyticsData.total_entries)}</span>
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-icon exit-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </div>
            <div class="metric-content">
              <span class="metric-label">Total Exits</span>
              <span class="metric-value">{formatNumber(analyticsData.total_exits)}</span>
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-icon net-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </div>
            <div class="metric-content">
              <span class="metric-label">Net Flow</span>
              <span class="metric-value" class:positive={calculateNetFlow(analyticsData.total_entries, analyticsData.total_exits) > 0} class:negative={calculateNetFlow(analyticsData.total_entries, analyticsData.total_exits) < 0}>
                {calculateNetFlow(analyticsData.total_entries, analyticsData.total_exits) > 0 ? '+' : ''}{formatNumber(calculateNetFlow(analyticsData.total_entries, analyticsData.total_exits))}
              </span>
            </div>
          </div>
          
          <!-- Removed Avg. Daily Entries and Avg. Daily Exits metrics cards as requested -->
        </div>
        
        {#if analyticsData.peak_day}
          <div class="peak-info-card">
            <h3>Peak Day</h3>
            <div class="peak-details">
              <div class="peak-stat">
                <span class="peak-label">Date</span>
                <span class="peak-value">{analyticsData.peak_day.date}</span>
              </div>
              <div class="peak-stat">
                <span class="peak-label">Entries</span>
                <span class="peak-value">{formatNumber(analyticsData.peak_day.entries)}</span>
              </div>
              <div class="peak-stat">
                <span class="peak-label">Exits</span>
                <span class="peak-value">{formatNumber(analyticsData.peak_day.exits)}</span>
              </div>
              <div class="peak-stat">
                <span class="peak-label">Net Flow</span>
                <span class="peak-value" class:positive={calculateNetFlow(analyticsData.peak_day.entries, analyticsData.peak_day.exits) > 0} class:negative={calculateNetFlow(analyticsData.peak_day.entries, analyticsData.peak_day.exits) < 0}>
                  {calculateNetFlow(analyticsData.peak_day.entries, analyticsData.peak_day.exits) > 0 ? '+' : ''}{formatNumber(calculateNetFlow(analyticsData.peak_day.entries, analyticsData.peak_day.exits))}
                </span>
              </div>
            </div>
          </div>
        {/if}
      </section>
      
      <!-- Charts Section -->
      <section class="charts-section">
        <!-- Traffic comparison charts only for Weekly/Monthly views -->
        {#if selectedInterval !== 'daily'}
          <div class="chart-container traffic-chart">
            <h3>
              {#if selectedInterval === 'weekly'}
                Weekly Traffic Distribution
              {:else}
                Monthly Traffic Distribution
              {/if}
            </h3>
            <div class="traffic-chart-wrapper" style="width:100%;">
              <canvas id="trafficChart" height="600" width="100%"></canvas>
            </div>
          </div>
        {/if}
        
        {#if analyticsData.hourly_breakdown && analyticsData.hourly_breakdown.length > 0}
          <div class="chart-container hourly-chart {selectedInterval === 'daily' ? 'full-width' : ''}">
            <h3>Today's Hourly Distribution</h3>
            <canvas id="hourlyChart" height="400"></canvas>
          </div>
        {/if}
      </section>
      
      <!-- Weekly Distribution Chart (Only shown on weekly view) -->
      {#if selectedInterval === 'weekly' && analyticsData.daily_breakdown && analyticsData.daily_breakdown.length > 0}
        <section class="distribution-section">
          <div class="chart-container">
            <h3>Traffic by Day of Week</h3>
            <p class="distribution-description">Aggregated traffic patterns showing which days of the week are busiest</p>
            <canvas id="weeklyDistributionChart"></canvas>
          </div>
        </section>
      {/if}
      
      <!-- Monthly Distribution Chart (Only shown on monthly view) -->
      {#if selectedInterval === 'monthly' && analyticsData.daily_breakdown && analyticsData.daily_breakdown.length > 0}
        <section class="distribution-section">
          <div class="chart-container">
            <h3>Traffic by Week of Month</h3>
            <p class="distribution-description">Aggregated traffic patterns showing which weeks of the month are busiest</p>
            <canvas id="monthlyDistributionChart"></canvas>
          </div>
        </section>
      {/if}
      
      <!-- Heatmap Visualization -->
      {#if analyticsData.hourly_breakdown && analyticsData.hourly_breakdown.length > 0}
        <section class="heatmap-section">
          <h3>Foot Traffic Heatmap</h3>
          <p class="heatmap-description">Color intensity represents traffic volume by hour (green: low, red: high)</p>
          <div class="heatmap-container">
            <canvas bind:this={heatmapCanvas} width="800" height="180"></canvas>
          </div>
        </section>
      {/if}
      
      <!-- Data Tables Section -->
      <section class="tables-section">
        {#if analyticsData.daily_breakdown && analyticsData.daily_breakdown.length > 0 && selectedInterval !== 'daily'}
          <div class="table-container">
            <h3>Daily Breakdown</h3>
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Entries</th>
                    <th>Exits</th>
                    <th>Net Flow</th>
                  </tr>
                </thead>
                <tbody>
                  {#each analyticsData.daily_breakdown as day}
                    <tr 
                      on:click={() => handleDateClick(day.date)}
                      class:selected={selectedDate === day.date}
                      class="clickable-row"
                    >
                      <td>{day.date}</td>
                      <td>{formatNumber(day.entries)}</td>
                      <td>{formatNumber(day.exits)}</td>
                      <td class:positive={calculateNetFlow(day.entries, day.exits) > 0} class:negative={calculateNetFlow(day.entries, day.exits) < 0}>
                        {calculateNetFlow(day.entries, day.exits) > 0 ? '+' : ''}{formatNumber(calculateNetFlow(day.entries, day.exits))}
                      </td>
                    </tr>

                    <!-- Show heatmap for selected date -->
                    {#if selectedDate === day.date}
                      <tr class="heatmap-row">
                        <td colspan="4" class="heatmap-cell">
                          {#if isLoadingDateData}
                            <div class="loading-container small">
                              <div class="loader"></div>
                              <p class="loading-message">Loading hourly data for {selectedDate}...</p>
                            </div>
                          {:else if dateDataError}
                            <p class="error-message">Error: {dateDataError}</p>
                            <button on:click={() => fetchHourlyDataForDate(selectedDate!)} disabled={isLoadingDateData}>Retry</button>
                          {:else if selectedDateHourlyData && selectedDateHourlyData.length > 0}
                            <div class="selected-date-heatmap-section">
                              <h4>Hourly Traffic for {selectedDate}</h4>
                              <p class="heatmap-description">Color intensity represents traffic volume by hour (green: low, red: high)</p>
                              <div class="heatmap-container">
                                <canvas bind:this={selectedDateHeatmapCanvas} width="800" height="180"></canvas>
                              </div>
                            </div>
                          {:else}
                            <p class="no-data-message">No hourly data available for {selectedDate}.</p>
                          {/if}
                        </td>
                      </tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        {/if}

        {#if analyticsData.hourly_breakdown && analyticsData.hourly_breakdown.length > 0}
          <div class="table-container">
            <h3>Today's Hourly Breakdown</h3>
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Hour</th>
                    <th>Entries</th>
                    <th>Exits</th>
                    <th>Net Flow</th>
                  </tr>
                </thead>
                <tbody>
                  {#each analyticsData.hourly_breakdown as hourData}
                    <tr>
                      <td>{hourData.hour}:00 - {hourData.hour + 1}:00</td>
                      <td>{formatNumber(hourData.entries)}</td>
                      <td>{formatNumber(hourData.exits)}</td>
                      <td class:positive={calculateNetFlow(hourData.entries, hourData.exits) > 0} class:negative={calculateNetFlow(hourData.entries, hourData.exits) < 0}>
                        {calculateNetFlow(hourData.entries, hourData.exits) > 0 ? '+' : ''}{formatNumber(calculateNetFlow(hourData.entries, hourData.exits))}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        {/if}
      </section>
    </div>
  {:else}
    <p class="no-data-message">No analytics data available for the selected period.</p>
  {/if}
</div>

<style>
  .analytics-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem;
    color: var(--text-primary);
  }

  h1 {
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 2.2rem;
    color: var(--text-primary);
  }
  
  h2 {
    font-size: 1.6rem;
    margin-bottom: 0.5rem;
  }
  
  h3 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  .controls {
    
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background-color: var(--bg-secondary);
    border-radius: 8px;
    box-shadow: 0 4px 6px var(--shadow-color);
    border: 1px solid var(--border-color);
  }

  .interval-selector {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .interval-selector button{
    padding: 0.6rem 1.2rem;
    border: 1px solid var(--border-color);
    background-color: var(--bg-primary);
    color: var(--text-primary);
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  .interval-selector button.active {
    background-color: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
  }
  
  /* Dashboard Content Layout */
  .dashboard-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  /* Summary Section */
  .summary-section {
    padding: 1.5rem;
    background-color: var(--bg-secondary);
    border-radius: 8px;
    box-shadow: 0 4px 6px var(--shadow-color);
    border: 1px solid var(--border-color);
  }
  
  .date-range {
    margin-bottom: 1.5rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
  
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .metric-card {
    display: flex;
    align-items: center;
    padding: 1.2rem;
    background-color: var(--bg-primary);
    border-radius: 8px;
    box-shadow: 0 2px 5px var(--shadow-color);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: 1px solid var(--border-color);
  }
  
  .metric-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 10px var(--shadow-color);
  }
  
  .metric-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
    flex-shrink: 0;
  }
  
  .entry-icon {
    background-color: rgba(34, 197, 94, 0.2);
    color: var(--entry-color);
    border: 1px solid rgba(34, 197, 94, 0.3);
  }
  
  .exit-icon {
    background-color: rgba(239, 68, 68, 0.2);
    color: var(--exit-color);
    border: 1px solid rgba(239, 68, 68, 0.3);
  }
  
  .net-icon {
    background-color: rgba(99, 102, 241, 0.2);
    color: var(--accent-color);
    border: 1px solid rgba(99, 102, 241, 0.3);
  }
  
  .metric-content {
    display: flex;
    flex-direction: column;
  }
  
  .metric-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 0.3rem;
    font-weight: 500;
  }
  
  .metric-value {
    font-size: 1.8rem;
    font-weight: bold;
    color: var(--text-primary);
  }
  
  .positive {
    color: var(--entry-color);
  }
  
  .negative {
    color: var(--exit-color);
  }
  
  .peak-info-card {
    padding: 1.2rem;
    background-color: var(--bg-primary);
    border-radius: 8px;
    box-shadow: 0 2px 5px var(--shadow-color);
    border: 1px solid var(--border-color);
  }
  
  .peak-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .peak-stat {
    display: flex;
    flex-direction: column;
  }
  
  .peak-label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 0.3rem;
    font-weight: 500;
  }
  
  .peak-value {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  /* Charts Section */
  .charts-section {
    width: 100%;
    display: block;
  }
  
  @media (min-width: 1200px) {
    .charts-section {
      grid-template-columns: 1fr 1fr;
    }
  }
  
  .chart-container {
    width: 100%;
    box-sizing: border-box;
    padding: 1.5rem;
    background-color: var(--bg-secondary);
    border-radius: 8px;
    box-shadow: 0 4px 6px var(--shadow-color);
    border: 1px solid var(--border-color);
  }
  
  canvas {
    width: 100%;
    max-height: 300px;
    background-color: var(--bg-secondary);
    border-radius: 4px;
  }
  
  /* Heatmap Section */
  .heatmap-section {
    padding: 1.5rem;
    background-color: var(--bg-secondary);
    border-radius: 8px;
    box-shadow: 0 4px 6px var(--shadow-color);
    border: 1px solid var(--border-color);
  }
  
  .heatmap-description {
    font-size: 1rem;
    color: var(--text-secondary);
    margin-bottom: 1rem;
  }
  
  .heatmap-container {
    width: 100%;
    overflow-x: auto;
    background-color: var(--bg-primary);
    border-radius: 4px;
    border: 1px solid var(--border-color);
  }
  
  /* Tables Section */
  .tables-section {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .table-container {
    padding: 1.5rem;
    background-color: var(--bg-secondary);
    border-radius: 8px;
    box-shadow: 0 4px 6px var(--shadow-color);
    border: 1px solid var(--border-color);
  }
  
  .table-wrapper {
    width: 100%;
    overflow-x: auto;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    background-color: var(--bg-secondary);
  }
  
  th, td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border-color);
  }
  
  th {
    background-color: var(--bg-primary);
    font-weight: 600;
    color: var(--text-priary);
  }
  
  tr:hover {
    background-color: var(--bg-primary);
  }
  
  /* Loading & Error Styles */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
  }
  
  .loader {
    width: 50px;
    height: 50px;
    border: 5px solid var(--border-color);
    border-radius: 50%;
    border-top-color: var(--accent-color);
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .loading-message {
    color: var(--text-secondary);
    font-weight: 500;
  }
  
  .error-message {
    color: var(--exit-color);
    background-color: rgba(239, 68, 68, 0.1);
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 1rem;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }
  
  .no-data-message {
    padding: 2rem;
    text-align: center;
    background-color: var(--bg-secondary);
    border-radius: 8px;
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 6px var(--shadow-color);
  }
  
  /* Responsive styles */
  @media (max-width: 768px) {
    .analytics-container {
      padding: 1rem;
    }
    
    .metrics-grid {
      grid-template-columns: 1fr;
    }
    
    .peak-details {
      grid-template-columns: 1fr 1fr;
    }
    
    .metric-value {
      font-size: 1.5rem;
    }
  }
  
  /* Clickable rows in tables */
  .clickable-row {
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .clickable-row:hover {
    background-color: var(--bg-hover);
  }
  
  .clickable-row.selected {
    background-color: var(--accent-color-light);
    border-bottom: none; /* Remove bottom border for selected row */
  }
  
  /* Heatmap row within table */
  .heatmap-row {
    background-color: var(--bg-secondary);
  }
  
  .heatmap-cell {
    padding: 1rem;
    background-color: var(--bg-primary);
  }
  
  .selected-date-heatmap-section {
    padding: 1rem;
    background-color: var(--bg-secondary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }
  
  .selected-date-heatmap-section h4 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  
  /* Smaller loading spinner for date data */
  .loading-container.small {
    min-height: 100px;
    padding: 1rem;
  }
  
  .loading-container.small .loader {
    width: 30px;
    height: 30px;
    border-width: 3px;
  }
  
  /* Distribution Section */
  .distribution-section {
    padding: 1.5rem;
    background-color: var(--bg-secondary);
    border-radius: 8px;
    box-shadow: 0 4px 6px var(--shadow-color);
    border: 1px solid var(--border-color);
    margin-bottom: 1.5rem;
  }
  
  .distribution-description {
    font-size: 1rem;
    color: var(--text-secondary);
    margin-bottom: 1rem;
  }
  
  /* Full width chart to make it larger */
  .full-width {
    grid-column: 1 / -1; /* Span across all columns */
  }
  
  /* Make the hourly chart taller */
  .hourly-chart canvas {
    max-height: 400px;
  }
  
  /* Make the weekly/monthly traffic chart larger */
  .traffic-chart-wrapper {
    width: 100%;
    position: relative;
  }
  
  .traffic-chart {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .traffic-chart canvas {
    width: 100% !important;
    max-height: 600px;
  }
</style> 