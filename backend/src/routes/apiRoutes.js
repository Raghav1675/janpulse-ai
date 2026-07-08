import express from 'express';
import { submitGrievance, clusterGrievances, updateStatus } from '../controllers/apiController.js';

const router = express.Router();

// Route for submitting grievances (Citizen)
router.post('/submit', submitGrievance);

// Route for fetching grievances (MP Dashboard)
router.get('/cluster', clusterGrievances);

// Route for updating status (MP Dashboard actions)
router.patch('/status', updateStatus);

export default router;