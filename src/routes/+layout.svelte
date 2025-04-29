<script lang="ts">
  import '../app.css';
  import '../dark-mode.css';
  import { onMount, onDestroy } from 'svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { api } from '$lib/services/api';
  import { browser } from '$app/environment';
  import { config } from '$lib/config';
  import { counterStore } from '$lib/stores/counterStore';
  
  // Sidebar state
  let sidebarCollapsed = false;
  
  // This function will be called when the window is about to be closed
  const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
    // Log reset attempt
    console.log('App closing, resetting counter data...');
    
    try {
      // Use the dedicated API method for app close
      if (browser) {
        // Try the sendBeacon method first (most reliable for page unload)
        const beaconSent = api.resetOnAppClose();
        
        // If beacon isn't supported or fails, try the regular fetch method
        if (!beaconSent) {
          await api.resetCounterData();
        }
      }
    } catch (error) {
      console.error('Failed to reset counter data on close:', error);
    }
  };
  
  // Initialize dark mode on mount and set up beforeunload handler
  onMount(() => {
    // Check if dark mode is already applied
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    const hasDarkMode = document.documentElement.classList.contains('dark-mode');
    
    console.log('Layout mounted, localStorage darkMode:', isDarkMode, 'DOM has dark-mode class:', hasDarkMode);
    
    // If there's a mismatch, fix it
    if (isDarkMode !== hasDarkMode) {
      console.log('Fixing dark mode mismatch in layout');
      if (isDarkMode) {
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
        document.body.classList.remove('dark-mode');
      }
    }
    
    // Add beforeunload event listener to reset counter data when app is closed
    if (browser) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }
    
    // Initialize counter store on mount
    counterStore.init();
  });
  
  // Clean up event listener when component is destroyed
  onDestroy(() => {
    if (browser) {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }
    
    // Disconnect socket on unmount
    counterStore.disconnect();
  });
</script>

<div class="app-container">
  <Sidebar bind:collapsed={sidebarCollapsed} />
  
  <main class="main-content" class:expanded={sidebarCollapsed}>
    <slot />
  </main>
</div>

<style>
  .app-container {
    display: flex;
    height: 100vh;
    width: 100%;
  }
  
  .main-content {
    flex-grow: 1;
    padding: 20px;
    overflow-y: auto;
    margin-left: 240px;
    transition: margin-left 0.3s ease;
    width: calc(100% - 240px);
  }
  
  .main-content.expanded {
    margin-left: 60px;
    width: calc(100% - 60px);
  }
</style> 