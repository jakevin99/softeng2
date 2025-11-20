import { pool } from '../config/db.js';

class CounterModel {
  // Get current stats
  /*1. Daily Statistics Storage:
Each day's total entry and exit counts are stored in the daily_stats table
The current day's running totals are kept in counter_stats
When a new day starts, the data from counter_stats is saved to daily_stats and counters reset to zero
2.Automatic Reset Detection:
Added a checkAndResetForNewDay method that runs with every counter update
The system compares the current date with the last update date
If the day has changed, it automatically:
Stores the previous day's totals in daily_stats
Resets counter_stats to zero for the new day
3.Scheduled Midnight Reset:
Added a backup scheduler that runs at midnight
This ensures counters reset even if no one uses the system around midnight
Uses a recursive setTimeout to always schedule the next check
4.Transaction Safety:
All database operations use transactions for data integrity
If any part of the process fails, the entire operation is rolled back*/ 
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
        // Check if day has changed and reset counter if needed
        await this.checkAndResetForNewDay(connection);
        
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
      
      // Get entries and exits by hour - converted to string concatenation
      const sqlQuery = "SELECT " +
        "DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') as time_interval, " +
        "SUM(CASE WHEN event_type = 'entry' THEN 1 ELSE 0 END) as entries, " +
        "SUM(CASE WHEN event_type = 'exit' THEN 1 ELSE 0 END) as exits " +
        "FROM counter_events " +
        "WHERE " + timeQuery + " " +
        "GROUP BY time_interval " +
        "ORDER BY time_interval";
      
      const [rows] = await pool.query(sqlQuery);
      
      return rows;
    } catch (error) {
      console.error('Error getting historical data:', error);
      throw error;
    }
  }
  
  /**
   * Get historical data for a custom date range
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Array>} Array of counter data within date range
   */
  async getCustomRangeData(startDate, endDate) {
    try {
      // Validate dates
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required');
      }
      
      // Format dates for query (ensure they cover the full day)
      const formattedStartDate = startDate + ' 00:00:00';
      const formattedEndDate = endDate + ' 23:59:59';
      
      // Get entries and exits by day for the custom range
      const [rows] = await pool.query(`
        SELECT 
          DATE(timestamp) as date,
          SUM(CASE WHEN event_type = 'entry' THEN 1 ELSE 0 END) as entries,
          SUM(CASE WHEN event_type = 'exit' THEN 1 ELSE 0 END) as exits
        FROM counter_events
        WHERE timestamp BETWEEN ? AND ?
        GROUP BY DATE(timestamp)
        ORDER BY date
      `, [formattedStartDate, formattedEndDate]);
      
      return rows;
    } catch (error) {
      console.error('Error getting custom range data:', error);
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
        // Check if day has changed and reset counter if needed
        await this.checkAndResetForNewDay(connection);
        
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

  /**
   * Get summarized historical data for a specific predefined interval (daily, weekly, monthly).
   * This method provides aggregated insights like total entries, total exits, averages, etc.
   * @param {string} interval - The interval ('daily', 'weekly', 'monthly')
   * @returns {Promise<Object>} Object containing summarized analytics data
   */
  async getSummarizedDataForInterval(interval) {
    try {
      let startDate;
      let endDate = 'CURDATE()'; // Default to current date for end
      let groupByFormat; // SQL format for grouping (e.g., by day, by week)
      let description;

      // Determine the date range and grouping based on the interval
      switch (interval) {
        case 'daily':
          // Data for today, potentially hourly breakdown
          startDate = 'CURDATE()';
          description = 'Today\'s Summary';
          // For daily, we might want to show hourly trends for the current day
          // This part can be refined based on specific requirements for "daily" summary
          // For now, let's get total entries/exits for today
          const sqlQueryDaily = "SELECT " +
            "SUM(CASE WHEN event_type = 'entry' THEN 1 ELSE 0 END) as total_entries, " +
            "SUM(CASE WHEN event_type = 'exit' THEN 1 ELSE 0 END) as total_exits " +
            "FROM counter_events " +
            "WHERE DATE(timestamp) = CURDATE()";
            
          const [todayStats] = await pool.query(sqlQueryDaily);
          
          // We can also include hourly data if needed, similar to getHistoricalData('day')
          const sqlQueryHourly = "SELECT " +
            "HOUR(timestamp) as hour, " +
            "SUM(CASE WHEN event_type = 'entry' THEN 1 ELSE 0 END) as entries, " +
            "SUM(CASE WHEN event_type = 'exit' THEN 1 ELSE 0 END) as exits " +
            "FROM counter_events " +
            "WHERE DATE(timestamp) = CURDATE() " +
            "GROUP BY HOUR(timestamp) " +
            "ORDER BY HOUR(timestamp)";
            
          const [hourlyToday] = await pool.query(sqlQueryHourly);
          
          return {
            description,
            interval,
            total_entries: parseInt(todayStats[0].total_entries) || 0,
            total_exits: parseInt(todayStats[0].total_exits) || 0,
            hourly_breakdown: hourlyToday,
          };
        case 'weekly':
          // Last 7 days
          startDate = 'DATE_SUB(CURDATE(), INTERVAL 6 DAY)'; // Inclusive of today
          groupByFormat = '%Y-%m-%d'; // Group by day for weekly summary
          description = 'Last 7 Days Summary';
          break;
        case 'monthly':
          // Last 30 days
          startDate = 'DATE_SUB(CURDATE(), INTERVAL 29 DAY)'; // Inclusive of today
          groupByFormat = '%Y-%m-%d'; // Group by day for monthly summary, could also be by week
          description = 'Last 30 Days Summary';
          break;
        default:
          throw new Error('Invalid interval specified for summarized data.');
      }

      // Query for weekly and monthly summaries (aggregated daily)
      // Refactored to use string concatenation to avoid template literal parsing issues.
      const sqlQueryInterval = "SELECT " +
        "DATE_FORMAT(timestamp, '" + groupByFormat + "') as period_group, " +
        "SUM(CASE WHEN event_type = 'entry' THEN 1 ELSE 0 END) as daily_entries, " +
        "SUM(CASE WHEN event_type = 'exit' THEN 1 ELSE 0 END) as daily_exits " +
        "FROM counter_events " +
        "WHERE DATE(timestamp) BETWEEN " + startDate + " AND " + endDate + " " +
        "GROUP BY period_group " +
        "ORDER BY period_group;";
      const [dailyAggregates] = await pool.query(sqlQueryInterval);

      if (!dailyAggregates || dailyAggregates.length === 0) {
        return {
          description,
          interval,
          total_entries: 0,
          total_exits: 0,
          average_daily_entries: 0,
          average_daily_exits: 0,
          peak_day: null,
          daily_breakdown: []
        };
      }

      const totalEntries = dailyAggregates.reduce((sum, day) => sum + parseInt(day.daily_entries), 0);
      const totalExits = dailyAggregates.reduce((sum, day) => sum + parseInt(day.daily_exits), 0);
      const numberOfDays = dailyAggregates.length;

      const averageDailyEntries = numberOfDays > 0 ? Math.round(totalEntries / numberOfDays) : 0;
      const averageDailyExits = numberOfDays > 0 ? Math.round(totalExits / numberOfDays) : 0;

      // Find peak day (most entries, or net positive flow)
      let peakDay = null;
      if (numberOfDays > 0) {
        peakDay = dailyAggregates.reduce((max, day) =>
          (parseInt(day.daily_entries) > parseInt(max.daily_entries) ? day : max), dailyAggregates[0]
        );
      }
      
      return {
        description,
        interval,
        total_entries: totalEntries,
        total_exits: totalExits,
        average_daily_entries: averageDailyEntries,
        average_daily_exits: averageDailyExits,
        peak_day: peakDay ? { date: peakDay.period_group, entries: parseInt(peakDay.daily_entries), exits: parseInt(peakDay.daily_exits) } : null,
        daily_breakdown: dailyAggregates.map(d => ({
          date: d.period_group,
          entries: parseInt(d.daily_entries),
          exits: parseInt(d.daily_exits)
        }))
      };

    } catch (error) {
      console.error('Error getting summarized data for interval:', error);
      throw error;
    }
  }

  /**
   * Get summarized historical data for a custom date range.
   * Provides aggregated insights like total entries, total exits, averages over the period.
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} Object containing summarized analytics data for the custom range
   */
  async getSummarizedDataForCustomRange(startDate, endDate) {
    try {
      // Validate dates
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required for custom range summary');
      }
      // const formattedStartDate = \`'\${startDate} 00:00:00\'\`; // No longer needed with parameterized query
      // const formattedEndDate = \`'\${endDate} 23:59:59\'\`;   // No longer needed with parameterized query
      const description = 'Summary from ' + startDate + ' to ' + endDate;

      // Query for daily aggregates within the custom range
      // Refactored to use string concatenation and parameterized query for dates.
      const sqlQueryCustom = "SELECT " +
        "DATE(timestamp) as period_date, " +
        "SUM(CASE WHEN event_type = 'entry' THEN 1 ELSE 0 END) as daily_entries, " +
        "SUM(CASE WHEN event_type = 'exit' THEN 1 ELSE 0 END) as daily_exits " +
        "FROM counter_events " +
        "WHERE timestamp BETWEEN ? AND ? " +
        "GROUP BY period_date " +
        "ORDER BY period_date;";
      
      // Convert template literals to string concatenation
      const queryParamStartDate = startDate + ' 00:00:00';
      const queryParamEndDate = endDate + ' 23:59:59';
      const [dailyAggregates] = await pool.query(sqlQueryCustom, [queryParamStartDate, queryParamEndDate]);

      if (!dailyAggregates || dailyAggregates.length === 0) {
        return {
          description,
          range: { startDate, endDate },
          total_entries: 0,
          total_exits: 0,
          average_daily_entries: 0,
          average_daily_exits: 0,
          peak_day: null,
          daily_breakdown: []
        };
      }

      const totalEntries = dailyAggregates.reduce((sum, day) => sum + parseInt(day.daily_entries), 0);
      const totalExits = dailyAggregates.reduce((sum, day) => sum + parseInt(day.daily_exits), 0);
      const numberOfDays = dailyAggregates.length;
      
      // Calculate the number of days in the range for accurate averaging
      // This can be more precise than dailyAggregates.length if there are days with no data
      const date1 = new Date(startDate);
      const date2 = new Date(endDate);
      const timeDiff = Math.abs(date2.getTime() - date1.getTime());
      const actualNumberOfDaysInRange = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;


      const averageDailyEntries = actualNumberOfDaysInRange > 0 ? Math.round(totalEntries / actualNumberOfDaysInRange) : 0;
      const averageDailyExits = actualNumberOfDaysInRange > 0 ? Math.round(totalExits / actualNumberOfDaysInRange) : 0;
      
      let peakDay = null;
      if (numberOfDays > 0) { // Check based on days with actual data
         peakDay = dailyAggregates.reduce((max, day) =>
          (parseInt(day.daily_entries) > parseInt(max.daily_entries) ? day : max), dailyAggregates[0]
        );
      }

      return {
        description,
        range: { startDate, endDate },
        total_entries: totalEntries,
        total_exits: totalExits,
        average_daily_entries: averageDailyEntries,
        average_daily_exits: averageDailyExits,
        peak_day: peakDay ? { 
          date: peakDay.period_date instanceof Date ? 
            peakDay.period_date.getFullYear() + '-' + 
            padZero(peakDay.period_date.getMonth() + 1) + '-' + 
            padZero(peakDay.period_date.getDate()) : 
            String(peakDay.period_date), 
          entries: parseInt(peakDay.daily_entries), 
          exits: parseInt(peakDay.daily_exits) 
        } : null,
        daily_breakdown: dailyAggregates.map(d => ({
          date: d.period_date instanceof Date ? 
            d.period_date.getFullYear() + '-' + 
            padZero(d.period_date.getMonth() + 1) + '-' + 
            padZero(d.period_date.getDate()) : 
            String(d.period_date),
          entries: parseInt(d.daily_entries),
          exits: parseInt(d.daily_exits)
        }))
      };

    } catch (error) {
      console.error('Error getting summarized data for custom range:', error);
      throw error;
    }
  }

  /**
   * Check if day has changed since last update and if so, 
   * store the current totals in daily_stats and reset counter_stats
   * 
   * This is a key part of the daily reset system:
   * 1. Each day's total entries and exits are stored in daily_stats
   * 2. The counter_stats table is reset to zero after the day changes
   * 3. This happens automatically on the first API call after midnight
   * 4. A scheduled task also checks at midnight to ensure reset occurs
   * 
   * @param {object} connection - Database connection to use (for transactions)
   * @returns {Promise<boolean>} - True if reset occurred, false otherwise
   */
  async checkAndResetForNewDay(connection) {
    try {
      // Get the current counter stats
      const [currentStats] = await connection.query('SELECT * FROM counter_stats WHERE id = 1');
      if (!currentStats || currentStats.length === 0) {
        return false;
      }
      
      const stats = currentStats[0];
      const lastUpdatedDate = stats.last_updated ? new Date(stats.last_updated) : null;
      
      // If no last update or it's the same day, no reset needed
      if (!lastUpdatedDate) {
        return false;
      }
      
      // Get current date (server time)
      const currentDate = new Date();
      
      // Check if the day has changed since last update
      const lastUpdatedDay = lastUpdatedDate.getDate();
      const lastUpdatedMonth = lastUpdatedDate.getMonth();
      const lastUpdatedYear = lastUpdatedDate.getFullYear();
      
      const currentDay = currentDate.getDate();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      // If it's still the same day, no reset needed
      if (lastUpdatedDay === currentDay && 
          lastUpdatedMonth === currentMonth && 
          lastUpdatedYear === currentYear) {
        return false;
      }
      
      // A new day has started - store yesterday's data in daily_stats
      const formattedDate = `${lastUpdatedYear}-${String(lastUpdatedMonth + 1).padStart(2, '0')}-${String(lastUpdatedDay).padStart(2, '0')}`;
      
      // Check if we already have an entry for this date in daily_stats
      const [existingRecord] = await connection.query(
        'SELECT * FROM daily_stats WHERE date = ?', 
        [formattedDate]
      );
      
      if (existingRecord && existingRecord.length > 0) {
        // Update existing record
        await connection.query(
          'UPDATE daily_stats SET total_entries = ?, total_exits = ?, peak_count = ?, updated_at = NOW() WHERE date = ?',
          [stats.total_entries, stats.total_exits, stats.current_count, formattedDate]
        );
      } else {
        // Insert new record
        await connection.query(
          'INSERT INTO daily_stats (date, total_entries, total_exits, peak_count, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
          [formattedDate, stats.total_entries, stats.total_exits, stats.current_count]
        );
      }
      
      // Reset counter_stats for the new day
      await connection.query(
        'UPDATE counter_stats SET current_count = 0, total_entries = 0, total_exits = 0, last_updated = NOW() WHERE id = 1'
      );
      
      console.log(`Counter reset for new day. Previous day (${formattedDate}) stats stored in daily_stats.`);
      return true;
      
    } catch (error) {
      console.error('Error checking/resetting for new day:', error);
      throw error;
    }
  }
  
  /**
   * Standalone version of checkAndResetForNewDay that manages its own connection
   * Used by the scheduled midnight task to reset counters without an API call
   * 
   * @returns {Promise<boolean>} - True if reset occurred, false otherwise
   */
  async checkAndResetForNewDayStandalone() {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await this.checkAndResetForNewDay(connection);
      await connection.commit();
      connection.release();
      return result;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  /**
   * Get hourly data for a specific date
   * Retrieves hourly entries and exits for the specified date
   * 
   * @param {string} date - The date to fetch data for in YYYY-MM-DD format
   * @returns {Promise<Object>} Object containing hourly breakdown for the specified date
   */
  async getHourlyDataForDate(date) {
    try {
      // Validate date
      if (!date) {
        throw new Error('Date is required for hourly data');
      }

      // Query for hourly data for the specified date
      const sqlQueryHourly = "SELECT " +
        "HOUR(timestamp) as hour, " +
        "SUM(CASE WHEN event_type = 'entry' THEN 1 ELSE 0 END) as entries, " +
        "SUM(CASE WHEN event_type = 'exit' THEN 1 ELSE 0 END) as exits " +
        "FROM counter_events " +
        "WHERE DATE(timestamp) = ? " +
        "GROUP BY HOUR(timestamp) " +
        "ORDER BY HOUR(timestamp)";
        
      const [hourlyData] = await pool.query(sqlQueryHourly, [date]);
      
      // Get total entries and exits for the day
      const sqlQueryTotals = "SELECT " +
        "SUM(CASE WHEN event_type = 'entry' THEN 1 ELSE 0 END) as total_entries, " +
        "SUM(CASE WHEN event_type = 'exit' THEN 1 ELSE 0 END) as total_exits " +
        "FROM counter_events " +
        "WHERE DATE(timestamp) = ?";
        
      const [totals] = await pool.query(sqlQueryTotals, [date]);
      
      // Format the response
      return {
        description: `Hourly Breakdown for ${date}`,
        date: date,
        total_entries: parseInt(totals[0]?.total_entries) || 0,
        total_exits: parseInt(totals[0]?.total_exits) || 0,
        hourly_breakdown: hourlyData.map(hour => ({
          hour: hour.hour,
          entries: parseInt(hour.entries),
          exits: parseInt(hour.exits)
        }))
      };
    } catch (error) {
      console.error('Error getting hourly data for date:', error);
      throw error;
    }
  }

  /**
   * Reset all counter values to zero
   * This resets current_count, total_entries, and total_exits
   * Useful for resetting the dashboard without waiting for the daily reset
   */
  async resetCounter() {
    try {
      const connection = await pool.getConnection();
      
      // Start transaction
      await connection.beginTransaction();
      
      try {
        // Reset counter stats to zero
        await connection.query(
          'UPDATE counter_stats SET current_count = 0, total_entries = 0, total_exits = 0, last_updated = NOW() WHERE id = 1'
        );
        
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
      console.error('Error resetting counter:', error);
      throw error;
    }
  }
}

// Helper function for padding date components with leading zeros
function padZero(num) {
  return num < 10 ? '0' + num : String(num);
}

export default new CounterModel(); 