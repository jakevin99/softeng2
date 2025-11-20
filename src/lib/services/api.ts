import { getApiBaseUrl } from '../config';
import { browser } from '$app/environment';

/**
 * Interface for API configuration options
 */
interface ApiConfig {
    baseUrl: string;
    apiKey: string;
}

/**
 * Interface for device data
 */
interface DeviceData {
    current_count: number;
    total_entries: number;
    total_exits: number;
    last_updated: string;
}

/**
 * Interface for API response
 */
interface ApiResponse<T> {
    success?: boolean;
    status?: string;
    message?: string;
    data: T;
}

/**
 * Interface for the cache item
 */
interface CacheItem<T> {
    data: T;
    timestamp: number;
}

/**
 * Get localStorage value safely (only in browser)
 * @param key The localStorage key to get
 * @param defaultValue Default value if not found
 */
function getLocalStorage(key: string, defaultValue: string): string {
    if (browser) {
        return localStorage.getItem(key) || defaultValue;
    }
    return defaultValue;
}

/**
 * API Service class to handle all API interactions
 * Implements caching and error handling
 */
class ApiService {
    private baseUrl: string;
    private apiKey: string;
    private cache: Map<string, CacheItem<any>> = new Map();
    private pendingRequests: Map<string, Promise<any>> = new Map();
    private readonly CACHE_DURATION = 2000; // 2 seconds cache for real-time data

    /**
     * Constructor - initialize with API configuration
     */
    constructor(config: ApiConfig) {
        this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash if present
        this.apiKey = config.apiKey;
    }

    /**
     * Generate a cache key from endpoint and parameters
     */
    private getCacheKey(endpoint: string, params?: Record<string, any>): string {
        return `${endpoint}${params ? JSON.stringify(params) : ''}`;
    }

    /**
     * Fetch data with authentication headers
     */
    private async fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        // Ensure the endpoint starts with a slash
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = `${this.baseUrl}${cleanEndpoint}`;
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        try {
            console.log(`Fetching from: ${url}`);
            const response = await fetch(url, { 
                ...options, 
                headers,
                signal: options.signal,
                mode: 'cors' // Explicitly set CORS mode
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            // Handle both error status formats
            if (data.status === 'error' || data.success === false) {
                throw new Error(data.message || 'API Error');
            }
            
            return data as ApiResponse<T>;
        } catch (error) {
            console.error('API call failed:', error, 'URL:', url);
            throw error;
        }
    }

    /**
     * Fetch with caching to avoid redundant API calls
     */
    private async fetchWithCache<T>(
        endpoint: string, 
        options: RequestInit = {}, 
        bypassCache: boolean = false
    ): Promise<ApiResponse<T>> {
        // Skip caching on server-side
        if (!browser) {
            return this.fetchWithAuth<T>(endpoint, options);
        }
        
        const cacheKey = this.getCacheKey(endpoint, options.body ? JSON.parse(options.body as string) : undefined);
        
        // Check cache first
        if (!bypassCache) {
            const cached = this.cache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
                return cached.data;
            }
        }

        // Check for pending request
        let pendingRequest = this.pendingRequests.get(cacheKey);
        if (pendingRequest) {
            return pendingRequest;
        }

        // Make new request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        try {
            const promise = this.fetchWithAuth<T>(endpoint, {
                ...options,
                signal: controller.signal
            });
            
            this.pendingRequests.set(cacheKey, promise);
            
            const data = await promise;
            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } finally {
            clearTimeout(timeoutId);
            this.pendingRequests.delete(cacheKey);
        }
    }

    /**
     * Get latest counter data
     */
    async getLatestDeviceData(): Promise<DeviceData> {
        try {
            console.log('Fetching latest counter data');
            const response = await this.fetchWithCache<DeviceData>('/api/counters', {
                method: 'GET'
            });
            console.log('API response:', response);
            
            // Check for proper response structure
            if (!response.data) {
                console.error('Unexpected API response format:', response);
                throw new Error('Invalid API response format');
            }
            
            return response.data;
        } catch (error) {
            console.error('Error in getLatestDeviceData:', error);
            throw error;
        }
    }

    /**
     * Get historical counter data
     */
    async getHistoricalData(period: string = 'day'): Promise<any> {
        const response = await this.fetchWithCache<any>(`/api/counters/history/${period}`, {
            method: 'GET'
        });
        return response.data;
    }

    /**
     * Create a new counter event (entry or exit)
     */
    async createCounterEvent(eventType: 'entry' | 'exit'): Promise<any> {
        const response = await this.fetchWithAuth<any>('/api/counters/events', {
            method: 'POST',
            body: JSON.stringify({ eventType })
        });
        return response.data;
    }

    /**
     * Simulate an entry event
     */
    async simulateEntry(): Promise<ApiResponse<any>> {
        return this.simulateEvent(1, 0);
    }
    
    /**
     * Simulate an exit event
     */
    async simulateExit(): Promise<ApiResponse<any>> {
        return this.simulateEvent(0, 1);
    }
    
    /**
     * Simulate a counter event
     */
    private async simulateEvent(entry: number, exit: number): Promise<ApiResponse<any>> {
        const response = await this.fetchWithCache('/api/v1/counter', {
            method: 'POST',
            body: JSON.stringify({ entry, exit })
        }, true); // bypass cache for POST
        
        // Clear cache after posting new data
        this.clearCache();
        return response;
    }
    
    /**
     * Reset all counter data to zero
     * This resets current count, today's entries, and today's exits to zero
     * Useful when resetting the dashboard
     */
    async resetCounterData(): Promise<ApiResponse<DeviceData>> {
        try {
            console.log('Resetting counter data...');
            const response = await this.fetchWithAuth<DeviceData>('/api/counters/reset', {
                method: 'DELETE'
            });
            
            // Clear cache after resetting data
            this.clearCache();
            
            console.log('Counter data reset successfully:', response);
            return response;
        } catch (error) {
            console.error('Error resetting counter data:', error);
            throw error;
        }
    }
    
    /**
     * Reset counter data when app is closing using sendBeacon
     * This is more reliable for app close events as fetch may be cancelled
     * 
     * @returns boolean True if the beacon was successfully queued
     */
    resetOnAppClose(): boolean {
        if (!browser || !navigator.sendBeacon) {
            console.error('SendBeacon not supported in this browser');
            return false;
        }
        
        try {
            // Use the special reset endpoint for beacons
            const resetUrl = `${this.baseUrl}/api/v1/counter/reset`;
            
            // Send an empty body - our backend will handle this as a reset action
            const result = navigator.sendBeacon(resetUrl);
            
            console.log('Reset beacon sent:', result ? 'success' : 'failed');
            return result;
        } catch (error) {
            console.error('Error sending reset beacon:', error);
            return false;
        }
    }

    /**
     * Clear the cache
     */
    clearCache(): void {
        this.cache.clear();
    }
}

// Create and export a singleton API instance
export const api = new ApiService({
    baseUrl: getApiBaseUrl(),
    apiKey: getLocalStorage('apiKey', '')
});

export type { DeviceData, ApiResponse }; 