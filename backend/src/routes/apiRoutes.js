import express from 'express';
import { submitGrievance, clusterGrievances } from '../controllers/apiController.js';

const router = express.Router();

// Define the endpoints and attach their controllers
router.post('/submit', submitGrievance);
router.post('/cluster', clusterGrievances);

export default router;