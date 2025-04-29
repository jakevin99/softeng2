import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Initialize from localStorage if in browser
const storedDarkMode = browser && localStorage.getItem('darkMode') === 'true';

// Create the store
const darkModeStore = writable(storedDarkMode || false);

// Apply dark mode function
function applyDarkMode(isDark: boolean): void {
  if (!browser) return;
  
  if (isDark) {
    document.documentElement.classList.add('dark-mode');
    document.body.classList.add('dark-mode');
    
    // Force a repaint to ensure styles are applied
    const currentBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = 'transparent';
    setTimeout(() => {
      document.body.style.backgroundColor = currentBg;
    }, 5);
  } else {
    document.documentElement.classList.remove('dark-mode');
    document.body.classList.remove('dark-mode');
  }
  
  // Log for debugging
  console.log('Dark mode applied:', isDark);
}

// Apply initial dark mode if needed
if (browser) {
  // Apply stored preference if available
  if (storedDarkMode) {
    applyDarkMode(true);
  }
  
  // Check system preference if no stored preference
  if (localStorage.getItem('darkMode') === null) {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
      darkModeStore.set(true);
      applyDarkMode(true);
    }
  }
}

// Create a custom store with a toggle method
export const darkMode = {
  subscribe: darkModeStore.subscribe,
  set: (value: boolean): void => {
    darkModeStore.set(value);
    if (browser) {
      localStorage.setItem('darkMode', value ? 'true' : 'false');
      applyDarkMode(value);
    }
  },
  toggle: (): void => {
    darkModeStore.update(value => {
      const newValue = !value;
      if (browser) {
        localStorage.setItem('darkMode', newValue ? 'true' : 'false');
        applyDarkMode(newValue);
      }
      return newValue;
    });
  }
}; 