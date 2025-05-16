# People Counter System

A comprehensive system for tracking room or building occupancy by counting people entering and exiting through designated passages. The system combines ESP32-based IoT devices, a Node.js backend API, and a SvelteKit frontend to provide real-time monitoring and historical analytics.

## System Architecture

The application follows a modern layered architecture with three main components:

1. **IoT Device Layer**:
   - ESP32 microcontrollers with VL53L1X Time-of-Flight sensors
   - Detection algorithm that monitors two zones to determine direction of movement
   - HTTP-based communication with the backend API
   - Local web interface for configuration and monitoring

2. **Backend Server Layer**:
   - RESTful API built with Express.js and Node.js
   - MySQL database for persistent storage of events and statistics
   - Socket.io for real-time data broadcasting to connected clients
   - Transactional data processing to ensure data integrity

3. **Frontend Application Layer**:
   - SvelteKit-based responsive web application
   - Real-time updates via Socket.io connections
   - Chart.js for data visualization and trend analysis
   - Responsive design supporting desktop and mobile devices

### Data Flow

1. **Data Collection**: VL53L1X sensors detect people moving through doorways by monitoring two detection zones
2. **Direction Analysis**: The firmware algorithm determines movement direction (entry vs exit)
3. **API Communication**: Device sends event data to the backend via HTTP POST requests
4. **Data Validation & Processing**: Backend validates input and processes events within database transactions
5. **State Management**: Current counts and statistics are updated atomically
6. **Real-time Notification**: Connected clients receive updates via Socket.io
7. **Data Visualization**: Frontend renders current state and historical trends

## Backend Implementation

The backend follows a well-structured MVC (Model-View-Controller) architecture with clear separation of concerns:

### Directory Structure

```
backend/
├── config/         # Configuration files
│   └── db.js       # Database connection and initialization
├── controllers/    # Request handlers
│   └── counterController.js  # Counter-related controllers
├── models/         # Data access and business logic
│   └── counterModel.js       # Counter-related database operations
├── routes/         # API route definitions
│   └── counterRoutes.js      # Counter endpoint routes
├── server.js       # Main application entry point
└── people_counter.sql  # Database schema
```

### API Design

- **RESTful Structure**: Follows REST conventions with proper resource naming and HTTP methods
- **Comprehensive Endpoints**: Supports current stats, historical data, and custom date ranges
- **Legacy Support**: Maintains backward compatibility for existing devices
- **Error Handling**: Consistent error responses with appropriate HTTP status codes
- **Middleware Use**: Uses Express middleware for CORS, JSON parsing, and Socket.io integration

### Database Schema

The MySQL database includes the following tables:

- `counter_events`: Records individual entry/exit events with timestamps
- `counter_stats`: Maintains current count and running totals

Note: The SQL dump file also includes a `daily_stats` table for aggregated daily statistics, but this table is not automatically created in the initialization code. To use all features as described, be sure to import the complete SQL schema.

### Data Processing Features

- **Transaction Management**: All database operations use transactions to ensure data integrity
- **Atomic Updates**: Current counts are updated atomically to prevent race conditions
- **Historical Analytics**: Flexible querying for different time periods (day/week/month)
- **Custom Range Reports**: Support for user-specified date ranges
- **Automatic Daily Reset**: Scheduled midnight reset mechanism to maintain accurate daily statistics

### Real-time Communication

- **Socket.io Integration**: Broadcasts counter updates to all connected clients
- **Event-Based Architecture**: Updates triggered by state changes
- **Low-Latency Updates**: Immediate notification of count changes
- **Bidirectional Communication**: Allows real-time dashboards to receive instant updates

## IoT Device Implementation

The ESP32 devices use VL53L1X Time-of-Flight sensors to detect people moving through doorways:

- **Dual-Zone Detection**: Two detection zones (LEFT and RIGHT) determine movement direction
- **Directional Logic**: LEFT→RIGHT movement counts as entry, RIGHT→LEFT as exit
- **WiFiManager Integration**: Easy WiFi configuration through captive portal
- **Configurable API Endpoint**: Device settings can be updated through web interface
- **JSON-Based Communication**: Structured data exchange with the backend

## Frontend Implementation

The SvelteKit frontend provides a responsive user interface for monitoring:

- **Real-time Dashboard**: Live updates of current occupancy count
- **Historical Data Visualization**: Interactive charts showing trends over time
- **Custom Date Range Analysis**: User-configurable time periods for data analysis
- **Responsive Design**: Optimized for both desktop and mobile devices

## Installation and Setup

### Prerequisites

- Node.js (v14+)
- MySQL database
- XAMPP or similar for local development
- Arduino IDE for device programming

### Database Setup

1. Create MySQL database:
   ```
   mysql -u root -p
   CREATE DATABASE people_counter;
   ```

2. Import database structure:
   ```
   mysql -u root -p people_counter < backend/people_counter.sql
   ```

### Backend Setup

1. Navigate to backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

4. Access the API at `http://localhost:3000/api`

### Frontend Setup

1. Return to the root directory and install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Access the frontend at `http://localhost:5173`

### ESP32 Device Setup

1. Open `DeviceCode` in Arduino IDE
2. Install required libraries:
   - VL53L1X
   - WiFiManager
   - HTTPClient
   - Wire
   - Preferences
3. Configure hardware connections:
   - SDA: GPIO 21
   - SCL: GPIO 22
   - XSHUT: GPIO 5
4. Upload to ESP32 device
5. Connect to the device's WiFi AP for initial configuration
6. Configure the API endpoint to point to your backend server

## API Reference

### Main Endpoints

#### Get Current Stats
```
GET /api/counters
```

Returns the current counter stats including current count, total entries, and total exits.

#### Get Historical Data
```
GET /api/counters/history/:period
```

Returns historical counter data for the specified period (day, week, month).

#### Get Custom Range Data
```
GET /api/counters/history/custom
```

Returns data for a custom date range specified by query parameters.

#### Get Analytics Summary
```
GET /api/counters/analytics/summary
```

Returns summarized analytics data by intervals (daily, weekly, monthly).

#### Create Event
```
POST /api/counters/events
```

Creates a new counter event (entry or exit).

### Legacy Endpoints (for backward compatibility)

```
POST /api/counter/update
POST /api/counter/exit
```

## Security Considerations

- Input validation to prevent SQL injection
- Error handling to avoid leaking sensitive information
- CORS configuration to control client access
- Transaction management to maintain data integrity
- Proper environment variable handling for sensitive configuration

## Development Guidelines

1. Follow RESTful API conventions for new endpoints
2. Use transactions for all database operations
3. Broadcast state changes through Socket.io
4. Maintain backward compatibility for device support
5. Implement proper error handling for all API endpoints

## License

MIT
