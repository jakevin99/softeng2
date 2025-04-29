# People Counter Backend Server

A Node.js backend server for the ESP32-based people counter device. This server receives data from the ESP32 device, stores it in a MySQL database, and provides real-time updates to the frontend via Socket.io.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the backend directory with the following contents:
   ```
   PORT=3000
   NODE_ENV=development

   # Database configuration (using XAMPP defaults)
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=people_counter
   ```

3. Create the MySQL database:
   - Open phpMyAdmin (http://localhost/phpmyadmin/)
   - Create a new database named `people_counter`
   - The tables will be created automatically when the server starts

4. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### GET `/api/counter/stats`
Get current counter statistics.

### POST `/api/counter/update`
Update counter data from the ESP device.
- Required body parameters: `entries` and `exits` (integers)

### POST `/api/counter/entry`
Log a single entry event (increments entry count by 1).

### POST `/api/counter/exit`
Log a single exit event (increments exit count by 1).

### GET `/api/counter/history/:period`
Get historical data for a specific time period.
- Valid periods: `day`, `week`, `month`

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