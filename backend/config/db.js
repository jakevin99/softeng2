import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'people_counter',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database
async function initDb() {
  try {
    const connection = await pool.getConnection();
    
    // Create tables if they don't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS counter_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type ENUM('entry', 'exit') NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX (timestamp)
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS counter_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        current_count INT NOT NULL DEFAULT 0,
        total_entries INT NOT NULL DEFAULT 0,
        total_exits INT NOT NULL DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY (id)
      )
    `);
    
    // Check if stats record exists, create if not
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM counter_stats');
    if (rows[0].count === 0) {
      await connection.query('INSERT INTO counter_stats (current_count, total_entries, total_exits) VALUES (0, 0, 0)');
    }
    
    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

export { pool, initDb }; 