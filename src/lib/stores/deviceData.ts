import { writable } from 'svelte/store';

/**
 * Device data interface
 */
export interface DeviceData {
  count: number;
  entries: number;
  exits: number;
  lastUpdated: Date;
}

/**
 * Initial state
 */
const initialState: DeviceData = {
  count: 0,
  entries: 0,
  exits: 0,
  lastUpdated: new Date()
};

/**
 * Create the writable store
 */
const deviceDataStore = writable<DeviceData>(initialState);

/**
 * Exported store with custom methods
 */
export const deviceData = {
  subscribe: deviceDataStore.subscribe,
  
  /**
   * Update with new data from device
   */
  update: (data: { count?: number, entries?: number, exits?: number }) => {
    deviceDataStore.update(currentData => {
      // Calculate current count as entries - exits if not provided
      const newCount = data.count !== undefined ? data.count : 
                     (data.entries !== undefined && data.exits !== undefined) ? 
                     data.entries - data.exits : currentData.count;
      
      return {
        count: newCount,
        entries: data.entries !== undefined ? data.entries : currentData.entries,
        exits: data.exits !== undefined ? data.exits : currentData.exits,
        lastUpdated: new Date()
      };
    });
  },
  
  /**
   * Reset to initial state
   */
  reset: () => {
    deviceDataStore.set(initialState);
  }
}; 