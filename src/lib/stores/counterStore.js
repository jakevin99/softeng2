import { writable } from 'svelte/store';
import { io } from 'socket.io-client';

// Base URL for API and WebSocket
const API_BASE_URL = 'http://localhost:3000/api/counter';
const SOCKET_URL = 'http://localhost:3000';

// Initial state with default values
const initialState = {
  currentCount: 0,
  totalEntries: 0,
  totalExits: 0,
  lastUpdated: null,
  isConnected: false,
  history: {
    day: [],
    week: [],
    month: []
  }
};

// Create the store
function createCounterStore() {
  const { subscribe, set, update } = writable(initialState);
  let socket;

  // Initialize Socket.io connection
  function initSocket() {
    // Close existing socket if any
    if (socket) {
      socket.disconnect();
    }

    // Create new socket connection
    socket = io(SOCKET_URL);

    // Socket event handlers
    socket.on('connect', () => {
      update(state => ({ ...state, isConnected: true }));
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      update(state => ({ ...state, isConnected: false }));
      console.log('Socket disconnected');
    });

    socket.on('counterUpdate', (data) => {
      update(state => ({
        ...state,
        currentCount: data.current_count,
        totalEntries: data.total_entries,
        totalExits: data.total_exits,
        lastUpdated: data.last_updated
      }));
    });
  }

  // Fetch current stats from the API
  async function fetchStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }
      
      const data = await response.json();
      
      update(state => ({
        ...state,
        currentCount: data.current_count,
        totalEntries: data.total_entries,
        totalExits: data.total_exits,
        lastUpdated: data.last_updated
      }));
      
      return data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  }

  // Fetch historical data for a specific period
  async function fetchHistory(period) {
    try {
      const response = await fetch(`${API_BASE_URL}/history/${period}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status}`);
      }
      
      const { data } = await response.json();
      
      update(state => ({
        ...state,
        history: {
          ...state.history,
          [period]: data
        }
      }));
      
      return data;
    } catch (error) {
      console.error(`Error fetching ${period} history:`, error);
      return [];
    }
  }

  // Log a single entry
  async function logEntry() {
    try {
      const response = await fetch(`${API_BASE_URL}/entry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to log entry: ${response.status}`);
      }
      
      const { data } = await response.json();
      
      update(state => ({
        ...state,
        currentCount: data.current_count,
        totalEntries: data.total_entries,
        lastUpdated: data.last_updated
      }));
      
      return data;
    } catch (error) {
      console.error('Error logging entry:', error);
      return null;
    }
  }

  // Log a single exit
  async function logExit() {
    try {
      const response = await fetch(`${API_BASE_URL}/exit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to log exit: ${response.status}`);
      }
      
      const { data } = await response.json();
      
      update(state => ({
        ...state,
        currentCount: data.current_count,
        totalExits: data.total_exits,
        lastUpdated: data.last_updated
      }));
      
      return data;
    } catch (error) {
      console.error('Error logging exit:', error);
      return null;
    }
  }

  // Initialize data loading
  async function init() {
    initSocket();
    await fetchStats();
    await fetchHistory('day');
  }

  return {
    subscribe,
    init,
    fetchStats,
    fetchHistory,
    logEntry,
    logExit,
    disconnect: () => {
      if (socket) {
        socket.disconnect();
      }
    }
  };
}

// Create and export the store instance
export const counterStore = createCounterStore(); 