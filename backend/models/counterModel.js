import { pool } from '../config/db.js';

class CounterModel {
  // Get current stats
  async getStats() {
    try {
      const [rows] = await pool.query('SELECT * FROM counter_stats WHERE id = 1');
      return rows[0];
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }

  // Update stats based on entry or exit
  async updateStats(eventType) {
    try {
      const connection = await pool.getConnection();
      
      // Start transaction
      await connection.beginTransaction();
      
      try {
        // Insert event
        await connection.query(
          'INSERT INTO counter_events (event_type) VALUES (?)',
          [eventType]
        );
        
        // Update stats based on event type
        if (eventType === 'entry') {
          await connection.query(
            'UPDATE counter_stats SET current_count = current_count + 1, total_entries = total_entries + 1, last_updated = NOW() WHERE id = 1'
          );
        } else if (eventType === 'exit') {
          await connection.query(
            'UPDATE counter_stats SET current_count = GREATEST(current_count - 1, 0), total_exits = total_exits + 1, last_updated = NOW() WHERE id = 1'
          );
        }
        
        // Commit transaction
        await connection.commit();
        
        // Get updated stats
        const [rows] = await connection.query('SELECT * FROM counter_stats WHERE id = 1');
        
        connection.release();
        return rows[0];
      } catch (error) {
        // Rollback on error
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Error updating stats:', error);
      throw error;
    }
  }
  
  // Get historical data for a specific time period
  async getHistoricalData(period) {
    try {
      let timeQuery;
      
      switch (period) {
        case 'day':
          timeQuery = 'DATE(timestamp) = CURDATE()';
          break;
        case 'week':
          timeQuery = 'timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
          break;
        case 'month':
          timeQuery = 'timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
          break;
        default:
          timeQuery = 'DATE(timestamp) = CURDATE()';
      }
      
      // Get entries and exits by hour
      const [rows] = await pool.query(`
        SELECT 
          DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') as time_interval,
          SUM(CASE WHEN event_type = 'entry' THEN 1 ELSE 0 END) as entries,
          SUM(CASE WHEN event_type = 'exit' THEN 1 ELSE 0 END) as exits
        FROM counter_events
        WHERE ${timeQuery}
        GROUP BY time_interval
        ORDER BY time_interval
      `);
      
      return rows;
    } catch (error) {
      console.error('Error getting historical data:', error);
      throw error;
    }
  }
  
  // Update count directly
  async updateCountDirectly(entries, exits) {
    try {
      const connection = await pool.getConnection();
      
      // Start transaction
      await connection.beginTransaction();
      
      try {
        // FIX: Use separate queries for updating stats based on what values are provided
        if (entries > 0 && exits > 0) {
          // Both entries and exits are present
          await connection.query(`
            UPDATE counter_stats 
            SET 
              current_count = current_count + ? - ?,
              total_entries = total_entries + ?,
              total_exits = total_exits + ?,
              last_updated = NOW() 
            WHERE id = 1
          `, [entries, exits, entries, exits]);
        } else if (entries > 0) {
          // Only entries provided
          await connection.query(`
            UPDATE counter_stats 
            SET 
              current_count = current_count + ?,
              total_entries = total_entries + ?,
              last_updated = NOW() 
            WHERE id = 1
          `, [entries, entries]);
        } else if (exits > 0) {
          // Only exits provided
          await connection.query(`
            UPDATE counter_stats 
            SET 
              current_count = GREATEST(current_count - ?, 0),
              total_exits = total_exits + ?,
              last_updated = NOW() 
            WHERE id = 1
          `, [exits, exits]);
        }
        
        // Ensure current_count doesn't go below zero
        await connection.query(`
          UPDATE counter_stats
          SET current_count = GREATEST(current_count, 0)
          WHERE id = 1
        `);
        
        // Add entries to events table if entries > 0
        if (entries > 0) {
          const entryValues = Array(entries).fill(['entry']).flat();
          const placeholders = entryValues.map(() => '(?)').join(',');
          await connection.query(
            `INSERT INTO counter_events (event_type) VALUES ${placeholders}`,
            entryValues
          );
        }
        
        // Add exits to events table if exits > 0
        if (exits > 0) {
          const exitValues = Array(exits).fill(['exit']).flat();
          const placeholders = exitValues.map(() => '(?)').join(',');
          await connection.query(
            `INSERT INTO counter_events (event_type) VALUES ${placeholders}`,
            exitValues
          );
        }
        
        // Commit transaction
        await connection.commit();
        
        // Get updated stats
        const [rows] = await connection.query('SELECT * FROM counter_stats WHERE id = 1');
        
        connection.release();
        return rows[0];
      } catch (error) {
        // Rollback on error
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Error updating stats directly:', error);
      throw error;
    }
  }
}

export default new CounterModel(); 