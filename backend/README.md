# People Counter Backend Server

A Node.js backend server for the ESP32-based people counter device. This server receives data from the ESP32 device, stores it in a MySQL database, and provides real-time updates to the frontend via Socket.io.

## Features

- REST API for device integration and data retrieval
- Real-time updates using Socket.io
- Database for storing counter events and statistics
- Historical data visualization support
- Transaction-based database operations for data integrity

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create the MySQL database:
   - Open phpMyAdmin (http://localhost/phpmyadmin/)
   - Create a new database named `people_counter`
   - The tables will be created automatically when the server starts (two main tables: `counter_events` and `counter_stats`)

3. Start the development server:
   ```
   npm run dev
   ```

**Note:** By default, the server uses the following configuration:
- Port: 3000
- Database host: localhost
- Database user: root
- Database password: (empty)
- Database name: people_counter

If you need to customize these settings, you can create a `.env` file in the backend directory with any of these values:
```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=people_counter
```

## API Endpoints

### GET `/api/counter/stats`
Get current counter statistics including current count, total entries, total exits, and last update time.

### POST `/api/counter/update`
Update counter data from the ESP device.
- Required body parameters: `entries` and/or `exits` (integers)
- This endpoint handles multiple entries/exits in a single request
- Updates both the counter statistics and logs individual events
- Returns updated statistics and emits Socket.io event

### POST `/api/counter/exit`
Log a single exit event (increments exit count by 1).
- Updates counter statistics and logs the event
- Returns updated statistics and emits Socket.io event

### GET `/api/counter/history/:period`
Get historical data for a specific time period.
- Valid periods: `day`, `week`, `month`
- Returns data aggregated by hour intervals

## Socket.io Integration

The server emits a `counterUpdate` event whenever the counter is updated. Connect your frontend to receive real-time updates:

```javascript
// Frontend Socket.io connection example
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('counterUpdate', (data) => {
  console.log('Counter updated:', data);
  // Update your UI with the new data
});
```

## Database Structure

The backend uses two primary tables:

1. `counter_stats` - Stores the current state:
   - current_count: Number of people currently in the room
   - total_entries: Total number of entries recorded
   - total_exits: Total number of exits recorded
   - last_updated: Timestamp of the last update

2. `counter_events` - Logs individual entry/exit events:
   - event_type: Either 'entry' or 'exit'
   - timestamp: When the event occurred

The database is automatically initialized on server start.

## ESP32 Device Integration

The ESP32 device should send HTTP POST requests to the `/api/counter/update` endpoint with the following JSON payload:

```json
{
  "entries": 1,
  "exits": 0
}
```

Or for multiple events in a single request:

```json
{
  "entries": 3,
  "exits": 2
}
``` 