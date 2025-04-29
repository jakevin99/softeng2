import express from 'express';
import counterController from '../controllers/counterController.js';

const router = express.Router();

// GET current stats
router.get('/stats', counterController.getStats);

// POST from ESP device - update counter data (main endpoint for all updates)
router.post('/update', counterController.updateCounterData);

// Log single exit event
router.post('/exit', counterController.logExit);

// GET historical data
router.get('/history/:period', counterController.getHistoricalData);

export default router; 