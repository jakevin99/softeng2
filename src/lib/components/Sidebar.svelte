<script lang="ts">
  import { page } from '$app/stores';
  
  // Sidebar state
  export let collapsed = false;
  
  function toggleSidebar() {
    collapsed = !collapsed;
  }
</script>

<div class="sidebar" class:collapsed>
  <div class="sidebar-header">
    <div class="logo">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
      <span>Simple Count</span>
    </div>
    
    <button class="collapse-btn" on:click={toggleSidebar} aria-label="Toggle sidebar">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
  </div>
  
  <nav class="nav-menu">
    <a href="/dashboard" class="nav-item" class:active={$page.url.pathname === '/dashboard'}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="9"></rect>
        <rect x="14" y="3" width="7" height="5"></rect>
        <rect x="14" y="12" width="7" height="9"></rect>
        <rect x="3" y="16" width="7" height="5"></rect>
      </svg>
      <span>Dashboard</span>
    </a>
    
    <a href="/" class="nav-item" class:active={$page.url.pathname === '/'}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 3v18h18"></path>
        <path d="M18.4 7.5l-7.8 9-4-3"></path>
      </svg>
      <span>Analytics</span>
    </a>
    
    <a href="/reports" class="nav-item" class:active={$page.url.pathname === '/reports'}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
      <span>Reports</span>
    </a>
    
    <a href="/settings" class="nav-item" class:active={$page.url.pathname === '/settings'}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
      <span>Settings</span>
    </a>
    
    <a href="/update" class="nav-item" class:active={$page.url.pathname === '/update'}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21.5 2v6h-6"></path>
        <path d="M2.5 22v-6h6"></path>
        <path d="M22 11.5A10 10 0 0 0 3 9"></path>
        <path d="M2 13a10 10 0 0 0 19 2.5"></path>
      </svg>
      <span>Update</span>
    </a>
  </nav>
  
  <div class="sidebar-footer">
    <div class="version-info">
      <span>Version 1.0.0</span>
    </div>
  </div>
</div>

<style>
  .sidebar {
    width: 240px;
    background-color: var(--sidebar-bg);
    color: var(--sidebar-text);
    display: flex;
    flex-direction: column;
    padding: 1.5rem 1rem;
    box-shadow: 2px 0 5px var(--shadow-color);
    transition: width 0.3s ease;
    overflow-x: hidden;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;
    box-sizing: border-box;
  }
  
  .sidebar.collapsed {
    width: 60px;
  }
  
  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--sidebar-border);
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .logo svg {
    min-width: 24px;
    min-height: 24px;
    color: currentColor;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
  }
  
  .sidebar.collapsed .logo span {
    display: none;
  }
  
  .logo span {
    font-weight: bold;
    font-size: 1.2rem;
    white-space: nowrap;
  }
  
  .collapse-btn {
    background: none;
    border: none;
    color: var(--sidebar-item);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease, background-color 0.2s;
  }
  
  .collapse-btn:hover {
    background-color: var(--sidebar-border);
  }
  
  .sidebar.collapsed .collapse-btn {
    transform: rotate(180deg);
  }
  
  .nav-menu {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex-grow: 1;
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    color: var(--sidebar-item);
    text-decoration: none;
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  
  .nav-item svg {
    min-width: 18px;
    min-height: 18px;
    color: currentColor;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
  }
  
  .sidebar.collapsed .nav-item {
    justify-content: center;
    padding: 0.75rem;
  }
  
  .sidebar.collapsed .nav-item span {
    display: none;
  }
  
  .nav-item:hover {
    background-color: var(--sidebar-border);
    color: var(--sidebar-text);
  }
  
  .nav-item.active {
    background-color: var(--sidebar-border);
    color: var(--sidebar-text);
    font-weight: 500;
  }
  
  .sidebar-footer {
    margin-top: auto;
    border-top: 1px solid var(--sidebar-border);
    padding-top: 1rem;
    width: 100%;
    min-height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .sidebar.collapsed .version-info {
    display: none;
  }
  
  .version-info {
    text-align: center;
    font-size: 0.75rem;
    color: var(--text-secondary);
    width: 100%;
    padding: 0 0.5rem;
  }
</style> 