# People Counter API

A RESTful API for the People Counter application, designed to track people entering and exiting rooms or buildings. This backend system receives data from ESP32-based IoT devices with VL53L1X Time-of-Flight sensors and provides endpoints for retrieving current counts and historical data.

## System Architecture

The backend implements a layered architecture:

- **REST API Layer**: Express.js routes handling HTTP requests following RESTful conventions
- **Business Logic Layer**: Controllers and models processing data and implementing business rules
- **Data Access Layer**: MySQL database storing counter events and aggregated statistics
- **Real-time Layer**: Socket.io for broadcasting counter updates to connected clients

## Database Design

The system uses MySQL with the following key tables:

- `counter_events`: Records individual entry/exit events with timestamps
- `counter_stats`: Maintains current count and running totals of entries/exits
- `daily_stats`: Aggregated daily statistics for reporting



## Data Processing Flow

1. **Data Reception**: IoT devices send entry/exit events via HTTP POST
2. **Data Validation**: Input is validated before processing
3. **Transaction Handling**: Database operations use transactions to ensure data integrity
4. **State Update**: Current counts are updated automically
5. **Event Logging**: Each event is recorded with a timestamp for historical tracking
6. **Real-time Broadcasting**: Updates are sent to connected clients via Socket.io

## API Resources and Endpoints

### Main Endpoints

#### Get Current Stats

```
GET /api/counters
```

Returns the current counter stats including current count, total entries, and total exits.

**Response**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "current_count": 15,
    "total_entries": 50,
    "total_exits": 35,
    "last_updated": "2025-04-29T14:30:00.000Z"
  }
}
```

#### Get Historical Data

```
GET /api/counters/history/:period
```

Returns historical counter data for the specified period (day, week, month).

**Parameters**

- `period`: The time period for which to retrieve data (day, week, month)

**Response**

```json
{
  "success": true,
  "data": [
    {
      "time_interval": "2025-04-29 08:00:00",
      "entries": 10,
      "exits": 5
    },
    {
      "time_interval": "2025-04-29 09:00:00",
      "entries": 15,
      "exits": 8
    }
  ],
  "period": "day"
}
```

#### Create Event

```
POST /api/counters/events
```

Creates a new counter event (entry or exit).

**Request Body**

```json
{
  "eventType": "entry" // or "exit"
}
```

**Response**

```json
{
  "success": true,
  "message": "entry event created successfully",
  "data": {
    "id": 1,
    "current_count": 16,
    "total_entries": 51,
    "total_exits": 35,
    "last_updated": "2025-04-29T14:35:00.000Z"
  }
}
```

### Legacy Endpoints

Maintained for backward compatibility with existing devices:

```
POST /api/counter/update
POST /api/counter/exit
```

## Error Handling

The API implements consistent error responses with appropriate HTTP status codes:

- 400: Bad Request - Invalid input
- 401: Unauthorized - Authentication failure
- 404: Not Found - Resource not found
- 500: Server Error - Internal processing error

## Real-time Updates

The system uses Socket.io to broadcast counter updates to connected clients. When counter data changes, the server emits a 'counterUpdate' event with the latest stats.

## Performance and Scalability

- **Database Transactions**: Ensures data integrity during concurrent operations
- **Optimized Queries**: Efficient SQL queries for analytics and reporting
- **Connection Pooling**: Manages database connections efficiently

## Security

- API key authentication for device access
- Input validation to prevent injection attacks
- CORS configuration for frontend security

## Development


