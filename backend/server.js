import express from 'express';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import counterRoutes from './routes/counterRoutes.js';
import counterModel from './models/counterModel.js';

// Import database initialization
import { initDb } from './config/db.js';

// Load environment variables
dotenv.config();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express
const app = express();
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

// Middleware
// Configure CORS with options
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Parse JSON request bodies
app.use(express.json());
// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Add Socket.io to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes - following RESTful conventions
// Mount counter routes at /api/counters
app.use('/api/counters', counterRoutes);

// Maintain backwards compatibility for devices
app.use('/api/counter', counterRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'People Counter API',
    version: '1.0',
    endpoints: {
      counters: '/api/counters',
      events: '/api/counters/events',
      history: '/api/counters/history/:period'
    }
  });
});

// Schedule a daily check at midnight to ensure counters are reset
// This provides a fallback in case no API calls happen around midnight
function scheduleMidnightReset() {
  // Get current time
  const now = new Date();
  
  // Calculate time until next midnight
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const timeUntilMidnight = tomorrow.getTime() - now.getTime();
  
  // Schedule the reset
  console.log(`Scheduling next counter reset check in ${Math.round(timeUntilMidnight/1000/60)} minutes`);
  
  setTimeout(async () => {
    try {
      // Run the counter reset logic
      const wasReset = await counterModel.checkAndResetForNewDayStandalone();
      if (wasReset) {
        console.log('Counters were reset by the scheduled midnight job');
        
        // Notify connected clients via socket.io if available
        if (io) {
          const updatedStats = await counterModel.getStats();
          io.emit('counterUpdate', updatedStats);
        }
      } else {
        console.log('No reset needed at scheduled check time');
      }
    } catch (error) {
      console.error('Error in scheduled midnight reset:', error);
    } finally {
      // Schedule the next check
      scheduleMidnightReset();
    }
  }, timeUntilMidnight);
}

// Serve static files for production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../public')));
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../public/index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  
  // Initialize database
  await initDb();
  
  // Start the midnight reset scheduler
  scheduleMidnightReset();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
}); 