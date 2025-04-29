import { config } from '../config';
import { deviceData } from '../stores/deviceData';
import { browser } from '$app/environment';

/**
 * Service for communicating with ESP32 devices through the API
 */
class ESP32Service {
    private apiKey: string;
    private baseUrl: string;
    
    /**
     * Constructor - initialize with configuration
     */
    constructor() {
        this.baseUrl = config.baseUrl;
        this.apiKey = browser ? localStorage.getItem('apiKey') || config.defaultApiKey : config.defaultApiKey;
    }
    
    /**
     * Set API key
     */
    setApiKey(key: string): void {
        this.apiKey = key;
        if (browser) {
            localStorage.setItem('apiKey', key);
        }
    }
    
    /**
     * Send command to ESP32 device through API
     * 
     * @param deviceIp IP address of the ESP32 device
     * @param command Command to send (entries/exits/reset)
     * @returns Promise with the response
     */
    async sendCommand(deviceIp: string, command: Record<string, any>): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/people_counter/backend/api/v1/esp32`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey
                },
                body: JSON.stringify({
                    device_ip: deviceIp,
                    command: command
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Update local store with the latest data if it's in the response
            if (data.data && (data.data.count !== undefined || 
                            data.data.entries !== undefined || 
                            data.data.exits !== undefined)) {
                deviceData.update({
                    count: data.data.count,
                    entries: data.data.entries,
                    exits: data.data.exits
                });
            }
            
            return data;
        } catch (error) {
            console.error('Error sending command to ESP32:', error);
            throw error;
        }
    }
    
    /**
     * Update entries count
     * 
     * @param deviceIp IP address of ESP32
     * @param entries New entries value or increment amount
     * @param isIncrement Whether this is an increment rather than absolute value
     */
    async updateEntries(deviceIp: string, entries: number, isIncrement: boolean = false): Promise<any> {
        return this.sendCommand(deviceIp, {
            action: 'update',
            entries: entries,
            is_increment: isIncrement
        });
    }
    
    /**
     * Update exits count
     * 
     * @param deviceIp IP address of ESP32
     * @param exits New exits value or decrement amount
     * @param isIncrement Whether this is an increment rather than absolute value
     */
    async updateExits(deviceIp: string, exits: number, isIncrement: boolean = false): Promise<any> {
        return this.sendCommand(deviceIp, {
            action: 'update',
            exits: exits,
            is_increment: isIncrement
        });
    }
    
    /**
     * Reset counters on ESP32
     * 
     * @param deviceIp IP address of ESP32
     */
    async resetCounters(deviceIp: string): Promise<any> {
        return this.sendCommand(deviceIp, {
            action: 'reset'
        });
    }
}

// Export singleton instance
export const esp32Service = new ESP32Service(); 