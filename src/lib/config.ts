/**
 * Global application configuration
 * Contains API endpoints and default settings
 */
export const config = {
    // Base URL for API requests - adjust for your environment
    // This should match your PHP backend server URL
    baseUrl: 'http://localhost:8000',
    
    // Default refresh rate in milliseconds
    refreshRate: 2000,
    
    // API version
    apiVersion: 'v1',
    
    // Default API key used when none is provided in localStorage
    defaultApiKey: 'dc5e84762dc94e97b211331f428842af',
    
    // ESP32 device configuration
    device: {
        // This should be the IP address of your ESP32 device on the network
        // Default to the IP shown in the serial monitor in your DeviceCode
        ip: '192.168.43.116'  // Replace with your ESP32's IP address
    }
};

/**
 * Get API base URL with current hostname if not specified
 */
export function getApiBaseUrl(): string {
    if (typeof window !== 'undefined') {
        // For client-side, use window.location.origin if baseUrl is not set
        return config.baseUrl || window.location.origin;
    }
    return config.baseUrl;
}

/**
 * Get device IP, with preference for stored value
 */
export function getDeviceIp(): string {
    if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('deviceIp') || config.device.ip;
    }
    return config.device.ip;
} 