# People Counter Application

A comprehensive people counting solution for tracking and analyzing foot traffic in physical spaces.

## Features

- **Real-time Counting**: Monitor entries and exits in real-time
- **Data Visualization**: Interactive charts and graphs for traffic analysis
- **Reports**: Generate detailed reports for specific time periods
- **Dashboard**: User-friendly dashboard with key metrics
- **Device Management**: Add and configure counting devices
- **User Settings**: Customize application preferences

## Technology Stack

- **Frontend**: SvelteKit, HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: MySQL
- **Charts**: Chart.js

## Installation

### Prerequisites

- Node.js (v14+)
- MySQL
- XAMPP/Apache server

### Setup Instructions

1. Clone the repository
   ```
   git clone https://github.com/jakevin99/softeng2.git
   cd softeng2
   ```

2. Install frontend dependencies
   ```
   npm install
   ```

3. Install backend dependencies
   ```
   cd backend
   npm install
   ```

4. Set up the database
   - Import the `backend/people_counter.sql` file to your MySQL server
   - Configure database connection in `backend/config/db.js`

5. Start the backend server
   ```
   cd backend
   npm start
   ```

6. Start the frontend development server
   ```
   npm run dev
   ```

7. Access the application at `http://localhost:5173`

## Project Structure

- `/src` - Frontend SvelteKit application
- `/backend` - Node.js/Express backend API
- `/static` - Static assets

## License

This project is proprietary and owned by Jake Viñas.
