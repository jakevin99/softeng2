<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { counterStore } from '$lib/stores/counterStore';
  import { config } from '$lib/config';

  
  // Dashboard data from counter store
  let currentCount = 0;
  let entries = 0;
  let exits = 0;
  let lastUpdated = '';
  let isConnected = false;
  let error: string | null = null;
  let isResetting = false;
  
  // Subscribe to counter store for real-time updates
  const unsubscribe = counterStore.subscribe((state) => {
    currentCount = state.currentCount;
    entries = state.totalEntries;
    exits = state.totalExits;
    isConnected = state.isConnected;
    
    // Format timestamp
    if (state.lastUpdated) {
      const date = new Date(state.lastUpdated);
      lastUpdated = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }
  });
  
  /**
   * Reset counter data
   * This resets all counter values to zero, simulating app close behavior
   */
  
  
  // Initialize counter data when the component mounts
  onMount(async () => {
    try {
      await counterStore.init();
    } catch (err) {
      console.error('Error initializing counter data:', err);
      error = err instanceof Error ? err.message : 'Failed to load counter data';
    }
  });
  
  // Clean up subscription on component destroy
  onDestroy(() => {
    unsubscribe();
    counterStore.disconnect();
  });
</script>

<div class="dashboard-container">
  <h1>People Counter Dashboard</h1>
  
  <div class="connection-status" class:connected={isConnected}>
    <span class="status-indicator"></span>
    {isConnected ? 'Connected to server' : 'Disconnected from server'}
  </div>
  
  {#if error}
    <div class="error-container">
      <p class="error-message">Error: {error}</p>
      <p class="error-details">
        Please make sure the backend server is running at {config.baseUrl}/api/counter
      </p>
      <button class="retry-button" on:click={() => counterStore.fetchStats()}>
        Retry
      </button>
    </div>
  {:else}
    <div class="stats-grid">
      <div class="stat-card current-card">
        <div class="icon-container">
          <div class="icon people-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="80" height="80">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
        </div>
        <div class="stat-content">
          <div class="stat-label">Current Count</div>
          <div class="stat-value">{currentCount}</div>
        </div>
        <div class="card-glow"></div>
      </div>
      
      <div class="stat-card entry-card">
        <div class="icon-container">
          <div class="icon entry-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 4h3a2 2 0 0 1 2 2v14"></path>
              <path d="M2 20h3"></path>
              <path d="M13 20h9"></path>
              <path d="M10 12v.01"></path>
              <path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"></path>
            </svg>
          </div>
        </div>
        <div class="stat-content">
          <div class="stat-label">Today's Entries</div>
          <div class="stat-value">{entries}</div>
        </div>
        <div class="card-glow"></div>
      </div>
      
      <div class="stat-card exit-card">
        <div class="icon-container">
          <div class="icon exit-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 4h3a2 2 0 0 1 2 2v14"></path>
              <path d="M2 20h3"></path>
              <path d="M13 20h9"></path>
              <path d="M10 12v.01"></path>
              <path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"></path>
            </svg>
          </div>
        </div>
        <div class="stat-content">
          <div class="stat-label">Today's Exits</div>
          <div class="stat-value">{exits}</div>
        </div>
        <div class="card-glow"></div>
      </div>
    </div>
    
    
  {/if}
  
  {#if lastUpdated}
    <div class="last-updated">
      Last updated: {lastUpdated}
    </div>
  {/if}
</div>

<style>
  .dashboard-container {
    max-width: 1800px;
    margin: 0 auto;
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 90vh;
  }
  
  h1 {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    font-weight: 700;
    color: var(--text-primary);
    text-align: center;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    letter-spacing: 0.05em;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3rem;
    margin: 0 auto;
    width: 100%;
    perspective: 1000px;
  }
  
  .stat-card {
    position: relative;
    background-color: rgba(30, 41, 59, 0.8);
    border-radius: 24px;
    padding: 4rem 3rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transform-style: preserve-3d;
  }
  
  .stat-card:hover {
    transform: translateY(-15px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
  
  .stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 24px;
    opacity: 0.7;
    z-index: -1;
    transition: opacity 0.4s ease;
  }
  
  .current-card::before {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(79, 70, 229, 0.2) 100%);
  }
  
  .entry-card::before {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(21, 128, 61, 0.2) 100%);
  }
  
  .exit-card::before {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(185, 28, 28, 0.2) 100%);
  }
  
  .stat-card:hover::before {
    opacity: 1;
  }
  
  .icon-container {
    position: relative;
    margin-bottom: 2.5rem;
    z-index: 2;
  }
  
  .icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(15, 23, 42, 0.7);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
  }
  
  .stat-card:hover .icon {
    transform: scale(1.1) translateZ(20px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }
  
  .people-icon {
    color: rgb(139, 92, 246);
  }
  
  .entry-icon {
    color: rgb(34, 197, 94);
  }
  
  .exit-icon {
    color: rgb(239, 68, 68);
  }
  
  .stat-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 2;
  }
  
  .stat-label {
    font-size: 2rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 1.5rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  
  .stat-value {
    font-size: 6rem;
    font-weight: 800;
    color: white;
    text-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
    line-height: 1;
  }
  
  .stat-card:hover .stat-value {
    transform: scale(1.1) translateZ(10px);
  }
  
  .card-glow {
    position: absolute;
    width: 100%;
    height: 40%;
    top: -20%;
    left: -50%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transform: rotate(35deg);
    transition: 0.5s;
  }
  
  .stat-card:hover .card-glow {
    left: 150%;
  }
  
  /* Specific glow colors for each card */
  .current-card .card-glow {
    background: linear-gradient(
      90deg,
      transparent,
      rgba(139, 92, 246, 0.2),
      transparent
    );
  }
  
  .entry-card .card-glow {
    background: linear-gradient(
      90deg,
      transparent,
      rgba(34, 197, 94, 0.2),
      transparent
    );
  }
  
  .exit-card .card-glow {
    background: linear-gradient(
      90deg,
      transparent,
      rgba(239, 68, 68, 0.2),
      transparent
    );
  }
  
  .last-updated {
    margin-top: 2rem;
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    font-size: 1rem;
  }
  
 
  
 
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .error-message {
    color: rgb(239, 68, 68);
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
  }
  
  .retry-button {
    background-color: var(--accent-color);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .retry-button:hover {
    background-color: var(--accent-hover);
  }
  
  @media (max-width: 1400px) {
    .stats-grid {
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2.5rem;
    }
    
    .stat-card {
      padding: 3.5rem 2.5rem;
    }
    
    .stat-label {
      font-size: 1.75rem;
    }
    
    .stat-value {
      font-size: 5rem;
    }
    
    .icon {
      width: 110px;
      height: 110px;
    }
  }
  
  @media (max-width: 768px) {
    .dashboard-container {
      padding: 30px 20px;
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 3rem;
    }
    
    .stat-card {
      padding: 2.5rem 1.5rem;
    }
    
    .stat-label {
      font-size: 1.5rem;
    }
    
    .stat-value {
      font-size: 4rem;
    }
    
    .icon {
      width: 90px;
      height: 90px;
    }
  }
  
  
  
  
  
  
 
  
  .connection-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 2rem;
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    background: rgba(30, 41, 59, 0.6);
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
    color: rgba(255, 255, 255, 0.7);
  }
  
  .status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: rgb(239, 68, 68);
  }
  
  .connected .status-indicator {
    background-color: rgb(34, 197, 94);
  }
</style> 