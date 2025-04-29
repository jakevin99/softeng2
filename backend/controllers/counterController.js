import counterModel from '../models/counterModel.js';

class CounterController {
  // Get current counter stats
  async getStats(req, res) {
    try {
      const stats = await counterModel.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ message: 'Error getting counter stats' });
    }
  }

  // Handle device data: entries and exits
  async updateCounterData(req, res) {
    try {
      const { entries, exits } = req.body;
      
      // Validate input
      if (entries === undefined || exits === undefined) {
        return res.status(400).json({ 
          message: 'Invalid input. Both entries and exits are required' 
        });
      }
      
      if (!Number.isInteger(parseInt(entries)) || !Number.isInteger(parseInt(exits))) {
        return res.status(400).json({ 
          message: 'Invalid input. Entries and exits must be integers' 
        });
      }
      
      // Update counter data
      const updatedStats = await counterModel.updateCountDirectly(
        parseInt(entries), 
        parseInt(exits)
      );
      
      // Send response
      res.json({
        message: 'Counter data updated successfully',
        data: updatedStats
      });
      
      // Emit updated stats if socket.io is available
      if (req.io) {
        req.io.emit('counterUpdate', updatedStats);
      }
      
    } catch (error) {
      console.error('Error updating counter data:', error);
      res.status(500).json({ message: 'Error updating counter data' });
    }
  }
  
  // Log a single entry event
  async logEntry(req, res) {
    try {
      const updatedStats = await counterModel.updateStats('entry');
      
      res.json({
        message: 'Entry logged successfully',
        data: updatedStats
      });
      
      // Emit updated stats if socket.io is available
      if (req.io) {
        req.io.emit('counterUpdate', updatedStats);
      }
      
    } catch (error) {
      console.error('Error logging entry:', error);
      res.status(500).json({ message: 'Error logging entry' });
    }
  }
  
  // Log a single exit event
  async logExit(req, res) {
    try {
      const updatedStats = await counterModel.updateStats('exit');
      
      res.json({
        message: 'Exit logged successfully',
        data: updatedStats
      });
      
      // Emit updated stats if socket.io is available
      if (req.io) {
        req.io.emit('counterUpdate', updatedStats);
      }
      
    } catch (error) {
      console.error('Error logging exit:', error);
      res.status(500).json({ message: 'Error logging exit' });
    }
  }
  
  // Get historical data
  async getHistoricalData(req, res) {
    try {
      const { period } = req.params;
      const validPeriods = ['day', 'week', 'month'];
      
      if (!validPeriods.includes(period)) {
        return res.status(400).json({ 
          message: 'Invalid period. Must be day, week, or month' 
        });
      }
      
      const data = await counterModel.getHistoricalData(period);
      
      res.json({
        message: `Historical data for ${period} retrieved successfully`,
        data
      });
      
    } catch (error) {
      console.error('Error getting historical data:', error);
      res.status(500).json({ message: 'Error getting historical data' });
    }
  }
}

export default new CounterController(); 