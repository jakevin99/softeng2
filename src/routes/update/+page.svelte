<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/services/api';
  
  // Update state
  let isCheckingForUpdates = false;
  let updateAvailable = false;
  let isUpdating = false;
  let updateComplete = false;
  let updateFailed = false;
  let currentVersion = '1.0.0';
  let latestVersion = '1.0.1';
  let updateNotes: string[] = [];
  let error: string | null = null;
  
  // Check for updates using RESTful API
  async function checkForUpdates() {
    isCheckingForUpdates = true;
    updateAvailable = false;
    updateComplete = false;
    updateFailed = false;
    error = null;
    
    
      
  }
  
  // Install update using RESTful API
  async function installUpdate() {
    isUpdating = true;
    updateComplete = false;
    updateFailed = false;
    error = null;
    
    try {
      // Make API call to install update using RESTful endpoint
      const response = await fetch(`${api.baseUrl}/api/system/updates/install`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: latestVersion
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process result
      updateComplete = data.success;
      
      // In a real app, you might handle redirecting or reloading after update
      if (updateComplete) {
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
      
    } catch (err) {
      console.error('Error installing update:', err);
      error = err instanceof Error ? err.message : 'Failed to install update';
      updateFailed = true;
    } finally {
      isUpdating = false;
    }
  }
  
  // Get update status text and class
  function getStatusInfo() {
    if (isCheckingForUpdates) {
      return { text: 'Checking for updates...', class: 'status-checking' };
    } else if (isUpdating) {
      return { text: 'Installing update...', class: 'status-updating' };
    } else if (updateComplete) {
      return { text: 'Update complete! The application will restart shortly.', class: 'status-success' };
    } else if (updateFailed) {
      return { text: `Update failed. ${error ? error : 'Please try again.'}`, class: 'status-error' };
    } else if (updateAvailable) {
      return { text: 'Update available!', class: 'status-available' };
    } else {
      return { text: 'No updates available', class: 'status-none' };
    }
  }
  
  // Check for updates on page load
  onMount(() => {
    // Automatically check for updates when the page loads
    checkForUpdates();
  });
</script>

<div class="update-container">
  <h1>Software Update</h1>
  
  <div class="update-card">
    <div class="update-header">
      <h2>Simple Count Update</h2>
      <div class="version-info">
        <div class="current-version">
          <span class="version-label">Current Version:</span>
          <span class="version-number">{currentVersion}</span>
        </div>
        {#if updateAvailable}
          <div class="latest-version">
            <span class="version-label">Latest Version:</span>
            <span class="version-number">{latestVersion}</span>
          </div>
        {/if}
      </div>
    </div>
    
    <div class="update-status {getStatusInfo().class}">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="status-icon">
        {#if isCheckingForUpdates || isUpdating}
          <!-- Loading spinner -->
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 6v6l4 2"></path>
        {:else if updateComplete}
          <!-- Checkmark -->
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        {:else if updateFailed}
          <!-- X mark -->
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        {:else if updateAvailable}
          <!-- Download icon -->
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        {:else}
          <!-- Info icon -->
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        {/if}
      </svg>
      <span>{getStatusInfo().text}</span>
    </div>
    
    {#if updateAvailable && !updateComplete && !isUpdating}
      <div class="update-notes">
        <h3>What's New in {latestVersion}</h3>
        <ul>
          {#each updateNotes as note}
            <li>{note}</li>
          {/each}
        </ul>
      </div>
    {/if}
    
    <div class="update-actions">
      {#if !isCheckingForUpdates && !isUpdating}
        {#if updateAvailable && !updateComplete}
          <button class="btn btn-primary" on:click={installUpdate}>
            Install Update
          </button>
        {/if}
        <button class="btn {updateAvailable ? 'btn-outline' : 'btn-primary'}" on:click={checkForUpdates} disabled={isCheckingForUpdates}>
          Check for Updates
        </button>
      {:else}
        <div class="progress-container">
          <div class="progress-bar" style="width: {isUpdating ? '75%' : '40%'}"></div>
        </div>
      {/if}
    </div>
  </div>
  
  <div class="update-info-card">
    <h3>About Updates</h3>
    <p>Simple Count automatically checks for updates to ensure you have the latest features and security improvements. Updates may include new features, bug fixes, and performance improvements.</p>
    
    <h3>Update History</h3>
    <div class="update-history">
     
      
    
      <div class="history-item">
        <div class="history-version">v1.0.0</div>
        <div class="history-date">Released: March 10, 2025</div>
        <div class="history-notes">
          <ul>
            <li>Initial release</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .update-container {
    max-width: 800px;
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
  
  h3 {
    font-size: 1rem;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
  }
  
  .update-card, .update-info-card {
    background-color: var(--bg-secondary);
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px var(--shadow-color);
    margin-bottom: 2rem;
    border: 1px solid var(--border-color);
  }
  
  .update-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .version-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .current-version, .latest-version {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .version-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
  
  .version-number {
    font-weight: 500;
  }
  
  .update-status {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    padding: 0.75rem;
    border-radius: 6px;
    background-color: var(--bg-primary);
  }
  
  /* Status colors */
  .status-checking, .status-updating {
    color: var(--accent-color);
  }
  
  .status-success, .status-available {
    color: var(--entry-color);
  }
  
  .status-error {
    color: var(--exit-color);
  }
  
  .status-none {
    color: var(--text-secondary);
  }
  
  /* Spinner animation for checking/updating */
  .status-checking .status-icon, .status-updating .status-icon {
    animation: spin 2s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .status-icon {
    flex-shrink: 0;
  }
  
  .update-notes {
    margin-bottom: 1.5rem;
  }
  
  .update-notes ul {
    padding-left: 1.5rem;
    margin-top: 0.5rem;
  }
  
  .update-notes li {
    margin-bottom: 0.5rem;
  }
  
  .update-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    border: none;
  }
  
  .btn-primary {
    background-color: var(--accent-color);
    color: white;
  }
  
  .btn-primary:hover {
    background-color: var(--accent-hover);
  }
  
  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .btn-outline {
    background-color: transparent;
    color: var(--accent-color);
    border: 1px solid var(--accent-color);
  }
  
  .btn-outline:hover {
    background-color: var(--bg-primary);
  }
  
  .progress-container {
    width: 100%;
    height: 8px;
    background-color: var(--bg-primary);
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-bar {
    height: 100%;
    background-color: var(--accent-color);
    transition: width 0.3s ease;
  }
  
  .update-history {
    margin-top: 1rem;
  }
  
  .history-item {
    padding: 1rem 0;
    border-bottom: 1px solid var(--border-color);
  }
  
  .history-item:last-child {
    border-bottom: none;
  }
  
  .history-version {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  
  .history-date {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }
  
  .history-notes ul {
    padding-left: 1.5rem;
    margin-top: 0.25rem;
    font-size: 0.875rem;
  }
  
  .history-notes li {
    margin-bottom: 0.25rem;
  }
</style> 