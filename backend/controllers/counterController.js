import counterModel from '../models/counterModel.js';

/**
 * Counter Controller
 * Handles operations for the counter resources following RESTful conventions
 */
class CounterController {
  /**
   * Get current counter stats
   * GET /counters
   */
  async getStats(req, res) {
    try {
      const stats = await counterModel.getStats();
      
      // Return 200 OK with data
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting stats:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error',
        message: 'Error retrieving counter stats' 
      });
    }
  }

  /**
   * Create a new counter event (entry or exit)
   * POST /counters/events
   */
  async createEvent(req, res) {
    try {
      const { eventType } = req.body;
      
      // Validate input
      if (!eventType || !['entry', 'exit'].includes(eventType)) {
        return res.status(400).json({ 
          success: false,
          error: 'Bad request',
          message: 'Invalid event type. Must be "entry" or "exit"' 
        });
      }
      
      // Update stats based on event type
      const updatedStats = await counterModel.updateStats(eventType);
      
      // Return 201 Created with data
      res.status(201).json({
        success: true,
        message: `${eventType} event created successfully`,
        data: updatedStats
      });
      
      // Emit updated stats if socket.io is available
      if (req.io) {
        req.io.emit('counterUpdate', updatedStats);
      }
      
    } catch (error) {
      console.error(`Error creating event:`, error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error',
        message: 'Error creating counter event' 
      });
    }
  }
  
  /**
   * Legacy method for backwards compatibility
   * Handle device data with multiple entries and exits
   * POST /update
   */
  async updateCounterData(req, res) {
    try {
      const { entries, exits, deviceId } = req.body;
      
      // Validate input
      if (entries === undefined || exits === undefined) {
        return res.status(400).json({ 
          success: false,
          error: 'Bad request',
          message: 'Invalid input. Both entries and exits are required' 
        });
      }
      
      if (!Number.isInteger(parseInt(entries)) || !Number.isInteger(parseInt(exits))) {
        return res.status(400).json({ 
          success: false,
          error: 'Bad request',
          message: 'Invalid input. Entries and exits must be integers' 
        });
      }
      
      // Log device ID if provided
      if (deviceId) {
        console.log(`Update request from device: ${deviceId}`);
      }
      
      // Update counter data
      const updatedStats = await counterModel.updateCountDirectly(
        parseInt(entries), 
        parseInt(exits)
      );
      
      // Return 200 OK with data
      res.status(200).json({
        success: true,
        message: 'Counter data updated successfully',
        data: updatedStats
      });
      
      // Emit updated stats if socket.io is available
      if (req.io) {
        req.io.emit('counterUpdate', updatedStats);
      }
      
    } catch (error) {
      console.error('Error updating counter data:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error',
        message: 'Error updating counter data' 
      });
    }
  }
  
  /**
   * Legacy method for backwards compatibility
   * Log a single exit event
   * POST /exit
   */
  async logExit(req, res) {
    try {
      const updatedStats = await counterModel.updateStats('exit');
      
      res.status(200).json({
        success: true,
        message: 'Exit logged successfully',
        data: updatedStats
      });
      
      // Emit updated stats if socket.io is available
      if (req.io) {
        req.io.emit('counterUpdate', updatedStats);
      }
      
    } catch (error) {
      console.error('Error logging exit:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error',
        message: 'Error logging exit' 
      });
    }
  }
  
  /**
   * Get historical counter data for a specific period
   * GET /counters/history/:period
   */
  async getHistoricalData(req, res) {
    try {
      const { period } = req.params;
      const validPeriods = ['day', 'week', 'month'];
      
      if (!validPeriods.includes(period)) {
        return res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Invalid period. Must be day, week, or month' 
        });
      }
      
      const data = await counterModel.getHistoricalData(period);
      
      // Return 200 OK with data
      return res.status(200).json({
        success: true,
        data: data,
        period: period
      });
      
    } catch (error) {
      console.error('Error getting historical data:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error',
        message: 'Error retrieving historical data' 
      });
    }
  }

  /**
   * Get historical counter data for a custom date range
   * GET /counters/history/custom
   */
  async getCustomRangeData(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      // Validate input
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Both startDate and endDate query parameters are required' 
        });
      }
      
      // Validate date format (basic validation)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Dates must be in YYYY-MM-DD format' 
        });
      }
      
      // Get data for custom range
      const data = await counterModel.getCustomRangeData(startDate, endDate);
      
      // Return 200 OK with data
      return res.status(200).json({
        success: true,
        data: data,
        period: 'custom',
        range: {
          startDate,
          endDate
        }
      });
      
    } catch (error) {
      console.error('Error getting custom range data:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error',
        message: 'Error retrieving custom range data' 
      });
    }
  }

  /**
   * Get summarized analytics data for a specific interval
   * GET /analytics/summary?interval=daily|weekly|monthly
   */
  async getAnalyticsSummary(req, res) {
    try {
      const { interval, startDate, endDate } = req.query;
      const validIntervals = ['daily', 'weekly', 'monthly'];

      // Validate interval if startDate and endDate are not provided
      if (!startDate && !endDate && (!interval || !validIntervals.includes(interval))) {
        return res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Invalid or missing interval. Must be daily, weekly, or monthly, or provide startDate and endDate for a custom range.'
        });
      }
      
      // Validate custom date range if provided
      if (startDate && endDate) {
        const dateRegex = /^\\d{4}-\\d{2}-\\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
          return res.status(400).json({
            success: false,
            error: 'Bad request',
            message: 'Custom dates must be in YYYY-MM-DD format'
          });
        }
      } else if (startDate && !endDate || !startDate && endDate) {
         return res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Both startDate and endDate are required for custom range analytics.'
        });
      }
      
      let data;
      let queryPeriod;

      if (startDate && endDate) {
        // Use custom range
        data = await counterModel.getSummarizedDataForCustomRange(startDate, endDate);
        queryPeriod = 'custom';
      } else {
        // Use predefined interval
        data = await counterModel.getSummarizedDataForInterval(interval);
        queryPeriod = interval;
      }

      // Return 200 OK with summarized data
      return res.status(200).json({
        success: true,
        data: data,
        interval: queryPeriod,
        ...(startDate && endDate && { range: { startDate, endDate } }) 
      });

    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Error retrieving analytics summary'
      });
    }
  }

  /**
   * Get hourly breakdown data for a specific date
   * GET /analytics/hourly-by-date?date=YYYY-MM-DD
   */
  async getHourlyDataByDate(req, res) {
    try {
      const { date } = req.query;
      
      // Validate date parameter
      if (!date) {
        return res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Date query parameter is required'
        });
      }
      
      // Validate date format (basic validation)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          success: false,
          error: 'Bad request',
          message: 'Date must be in YYYY-MM-DD format'
        });
      }
      
      // Get hourly data for the specified date
      const data = await counterModel.getHourlyDataForDate(date);
      
      // Return 200 OK with data
      return res.status(200).json({
        success: true,
        data: data,
        date: date
      });
      
    } catch (error) {
      console.error('Error getting hourly data by date:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Error retrieving hourly data for date'
      });
    }
  }
}

export default new CounterController(); 