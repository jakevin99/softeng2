import express from 'express';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Import routes
import counterRoutes from './routes/counterRoutes.js';

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
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add Socket.io to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/counter', counterRoutes);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

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
  
  // Initialize database
  await initDb();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
}); 