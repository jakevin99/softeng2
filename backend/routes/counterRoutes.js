import express from 'express';
import counterController from '../controllers/counterController.js';

const router = express.Router();

/**
 * Counter resource endpoints
 * Following RESTful conventions:
 * - Use nouns for resources
 * - Use appropriate HTTP methods
 * - Use hierarchical structure
 */

// GET /counters - Get current stats (main counter resource)
router.get('/', counterController.getStats);

// GET /counters/history/custom - Get custom date range data 
// NOTE: This must be before the ':period' route to avoid being treated as a period parameter
router.get('/history/custom', counterController.getCustomRangeData);

// GET /counters/history/:period - Get historical data
router.get('/history/:period', counterController.getHistoricalData);

// New route for analytics summaries
// GET /analytics/summary?interval=daily|weekly|monthly - Get summarized analytics data
router.get('/analytics/summary', counterController.getAnalyticsSummary);

// GET /analytics/hourly-by-date?date=YYYY-MM-DD - Get hourly breakdown for a specific date
router.get('/analytics/hourly-by-date', counterController.getHourlyDataByDate);

// Events resource endpoints
// POST /counters/events - Create new entry or exit event
router.post('/events', counterController.createEvent);

// DELETE /counters/reset - Reset all counter data to zero
router.delete('/reset', counterController.resetCounterData);

// Backward compatibility routes - these will be deprecated
// POST /update - Legacy endpoint for updating counter data (maintained for device compatibility)
router.post('/update', counterController.updateCounterData);
// POST /exit - Legacy endpoint for logging exit (maintained for compatibility)
router.post('/exit', counterController.logExit);

export default router; 