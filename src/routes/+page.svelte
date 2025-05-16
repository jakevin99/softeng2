<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  
  // Redirect to dashboard on mount
  onMount(() => {
    goto('/dashboard');
  });
</script>

<div class="home-container">
  <h1>People Counter</h1>
  <p>Redirecting to dashboard...</p>
  
  <div class="loading-spinner"></div>
  
  <div class="manual-navigation">
    <p>If you're not redirected automatically, please click the button below:</p>
    <button class="btn-dashboard" on:click={() => goto('/dashboard')}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="9"></rect>
        <rect x="14" y="3" width="7" height="5"></rect>
        <rect x="14" y="12" width="7" height="9"></rect>
        <rect x="3" y="16" width="7" height="5"></rect>
      </svg>
      Go to Dashboard
    </button>
  </div>
</div>

<style>
  .home-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 20px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 90vh;
  }
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }
  
  p {
    color: var(--text-secondary);
    margin-bottom: 2rem;
    font-size: 1.2rem;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--bg-secondary);
    border-top: 4px solid var(--accent-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 2rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .manual-navigation {
    margin-top: 2rem;
    padding: 1.5rem;
    background-color: var(--bg-secondary);
    border-radius: 8px;
    box-shadow: 0 1px 3px var(--shadow-color);
  }
  
  .manual-navigation p {
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
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    margin: 0 auto;
  }
  
  .btn-dashboard:hover {
    background-color: var(--accent-hover);
  }
</style>
