/**
 * Global application configuration
 * Contains API endpoints and default settings
 */
export const config = {
    // Base URL for API requests - adjust for your environment
    baseUrl: 'http://localhost:3000',
    
   
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
