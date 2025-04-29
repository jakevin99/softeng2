# People Counter Application

A real-time people counting system that tracks entries and exits in a specific area.

## Features

- Real-time people counting with entry and exit tracking
- Dashboard visualization with statistics and analytics
- Historical data storage and reporting
- Responsive design for desktop and mobile

## Technology Stack

- **Frontend**: SvelteKit, TypeScript, Chart.js
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: MySQL

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- MySQL
- Web browser

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:
   - Create a MySQL database
   - Import the `people_counter.sql` file
   - Configure the database connection in `.env` file

4. Start the backend server:
   ```
   npm start
   ```

### Frontend Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

## Device Setup (for counter hardware)

Refer to the DeviceCode file for instructions on setting up the physical counting device.

## License

MIT 