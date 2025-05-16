<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { darkMode } from '$lib/stores/theme';
  
  // Settings page data
  let dataRetentionDays = 30;
  let isDarkMode = false;
  
  // Subscribe to the dark mode store
  const unsubscribe = darkMode.subscribe(value => {
    isDarkMode = value;
    console.log('Settings page - Dark mode state:', value);
  });
  
  // Toggle dark mode
  function toggleDarkMode() {
    console.log('Toggling dark mode from', isDarkMode, 'to', !isDarkMode);
    darkMode.toggle();
  }
  
  // Save settings
  function saveSettings() {
    // Save to localStorage
    localStorage.setItem('dataRetentionDays', dataRetentionDays.toString());
    alert('Settings saved successfully!');
  }
  
  // Reset settings
  function resetSettings() {
    dataRetentionDays = 30;
    darkMode.set(false);
  }
  
  // Initialize settings from localStorage
  onMount(() => {
    // Load other settings
    const savedRetention = localStorage.getItem('dataRetentionDays');
    if (savedRetention !== null) {
      dataRetentionDays = parseInt(savedRetention);
    }
    
    // Check if dark mode is already applied to the DOM
    const hasDarkMode = document.documentElement.classList.contains('dark-mode');
    console.log('Settings page mounted, DOM has dark-mode class:', hasDarkMode, 'store value:', isDarkMode);
    
    // If there's a mismatch, fix it
    if (hasDarkMode !== isDarkMode) {
      console.log('Fixing dark mode mismatch');
      darkMode.set(hasDarkMode);
    }
  });
  
  // Clean up subscription
  onDestroy(() => {
    unsubscribe();
  });
</script>

<div class="settings-container">
  <h1>Settings</h1>
  <div class="settings-section">
    <h2>Appearance</h2>
    
    <div class="setting-item">
      <div class="setting-info">
        <span class="setting-label">Dark Mode</span>
        <span class="setting-description">Use dark theme for the application</span>
      </div>
      <label class="toggle">
        <input type="checkbox" bind:checked={isDarkMode} on:change={toggleDarkMode}>
        <span class="toggle-slider"></span>
      </label>
    </div>
  </div>
  
  <div class="settings-actions">
    <button class="btn btn-secondary" on:click={resetSettings}>Reset to Defaults</button>
    <button class="btn btn-primary" on:click={saveSettings}>Save Changes</button>
  </div>
</div>

<style>
  .settings-container {
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
  
  .settings-section {
    background-color: var(--bg-secondary);
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px var(--shadow-color);
    margin-bottom: 2rem;
  }
  
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid var(--border-color);
  }
  
  .setting-item:last-child {
    border-bottom: none;
  }
  
  .setting-info {
    display: flex;
    flex-direction: column;
  }
  
  .setting-label {
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
  
  .setting-description {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
  
 
  

  
  /* Toggle Switch */
  .toggle {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 24px;
  }
  
  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--border-color);
    transition: .4s;
    border-radius: 24px;
  }
  
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: var(--bg-secondary);
    transition: .4s;
    border-radius: 50%;
  }
  
  input:checked + .toggle-slider {
    background-color: var(--accent-color);
  }
  
  input:checked + .toggle-slider:before {
    transform: translateX(24px);
  }
  /* Buttons */
  .settings-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
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
  
  .btn-secondary {
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }
  
  .btn-secondary:hover {
    background-color: var(--border-color);
  }
</style> 