import { writable } from 'svelte/store';
import { io, Socket } from 'socket.io-client';
import { api } from '$lib/services/api';

// Base URL for WebSocket - API URLs are handled by the API service
const SOCKET_URL = 'http://localhost:3000';

// Define types for our data
interface CounterState {
  currentCount: number;
  totalEntries: number;
  totalExits: number;
  lastUpdated: string | null;
  isConnected: boolean;
  error: string | null;
  history: {
    day: any[];
    week: any[];
    month: any[];
  }
}

// Define type for counter event
type CounterEventType = 'entry' | 'exit';

// Define type for API response data
interface CounterData {
  current_count: number;
  total_entries: number;
  total_exits: number;
  last_updated: string;
}

// Initial state with default values
const initialState: CounterState = {
  currentCount: 0,
  totalEntries: 0,
  totalExits: 0,
  lastUpdated: null,
  isConnected: false,
  error: null,
  history: {
    day: [],
    week: [],
    month: []
  }
};

/**
 * Create the counter store
 * Manages state and API interactions for the counter functionality
 */
function createCounterStore() {
  const { subscribe, set, update } = writable<CounterState>(initialState);
  let socket: Socket | null = null;

  /**
   * Initialize Socket.io connection for real-time updates
   */
  function initSocket() {
    // Close existing socket if any
    if (socket) {
      socket.disconnect();
    }

    // Create new socket connection
    socket = io(SOCKET_URL);

    // Socket event handlers
    socket.on('connect', () => {
      update(state => ({ ...state, isConnected: true, error: null }));
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      update(state => ({ ...state, isConnected: false }));
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      update(state => ({ ...state, isConnected: false, error: 'Connection error' }));
    });

    socket.on('counterUpdate', (data: CounterData) => {
      update(state => ({
        ...state,
        currentCount: data.current_count,
        totalEntries: data.total_entries,
        totalExits: data.total_exits,
        lastUpdated: data.last_updated,
        error: null
      }));
    });
    
    // Listen for entry events
    socket.on('entry', (data: any) => {
      update(state => ({
        ...state,
        currentCount: state.currentCount + 1,
        totalEntries: state.totalEntries + 1,
        lastUpdated: new Date().toISOString(),
        error: null
      }));
    });
    
    // Listen for exit events
    socket.on('exit', (data: any) => {
      update(state => ({
        ...state,
        currentCount: Math.max(0, state.currentCount - 1),
        totalExits: state.totalExits + 1,
        lastUpdated: new Date().toISOString(),
        error: null
      }));
    });
  }

  /**
   * Fetch current stats from the API
   * Uses the API service's getLatestDeviceData method
   */
  async function fetchStats() {
    try {
      console.log('fetchStats called');
      const deviceData = await api.getLatestDeviceData();
      console.log('deviceData from API:', deviceData);
      
      if (!deviceData) {
        throw new Error('No data received from API');
      }
      
      // Data should have these fields from the API
      const data = {
        current_count: deviceData.current_count || 0,
        total_entries: deviceData.total_entries || 0,
        total_exits: deviceData.total_exits || 0,
        last_updated: deviceData.last_updated || new Date().toISOString()
      };
      
      console.log('Processed data:', data);
      
      // Update store with data from API
      update(state => ({
        ...state,
        currentCount: data.current_count,
        totalEntries: data.total_entries,
        totalExits: data.total_exits,
        lastUpdated: data.last_updated,
        error: null
      }));
      
      return data;
    } catch (error: unknown) {
      console.error('Error fetching stats:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch counter data';
      update(state => ({ ...state, error: errorMessage }));
      return null;
    }
  }

  /**
   * Fetch historical data for a specific period
   * @param {string} period - 'day', 'week', or 'month'
   */
  async function fetchHistory(period: 'day' | 'week' | 'month') {
    try {
      const data = await api.getHistoricalData(period);
      
      update(state => ({
        ...state,
        history: {
          ...state.history,
          [period]: data
        },
        error: null
      }));
      
      return data;
    } catch (error: unknown) {
      console.error(`Error fetching ${period} history:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch ${period} history`;
      update(state => ({ ...state, error: errorMessage }));
      return [];
    }
  }

  /**
   * Create a new counter event (entry or exit)
   * @param {CounterEventType} eventType - 'entry' or 'exit'
   */
  async function createEvent(eventType: CounterEventType) {
    if (!['entry', 'exit'].includes(eventType)) {
      throw new Error('Invalid event type. Must be "entry" or "exit"');
    }
    
    try {
      const data = await api.createCounterEvent(eventType) as CounterData;
      
      update(state => ({
        ...state,
        currentCount: data.current_count,
        totalEntries: data.total_entries,
        totalExits: data.total_exits,
        lastUpdated: data.last_updated,
        error: null
      }));
      
      return data;
    } catch (error: unknown) {
      console.error(`Error creating ${eventType} event:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to log ${eventType}`;
      update(state => ({ ...state, error: errorMessage }));
      return null;
    }
  }

  /**
   * Log a single entry
   * Convenience method that uses createEvent('entry')
   */
  async function logEntry() {
    return createEvent('entry');
  }

  /**
   * Log a single exit
   * Convenience method that uses createEvent('exit')
   */
  async function logExit() {
    return createEvent('exit');
  }

  /**
   * Initialize data loading
   */
  async function init() {
    initSocket();
    await fetchStats();
    await fetchHistory('day');
  }

  /**
   * Clear error state
   */
  function clearError() {
    update(state => ({ ...state, error: null }));
  }

  return {
    subscribe,
    init,
    fetchStats,
    fetchHistory,
    createEvent,
    logEntry,
    logExit,
    clearError,
    disconnect: () => {
      if (socket) {
        socket.disconnect();
      }
    }
  };
}

// Create and export the store instance
export const counterStore = createCounterStore(); 