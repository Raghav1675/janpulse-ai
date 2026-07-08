// import express from 'express';
// import cors from 'cors';
// import { spawn } from 'child_process';
// import { processCitizenSubmission } from './services/geminiService.js';

// const app = express();
// app.use(cors());
// app.use(express.json({ limit: '50mb' }));

// // 1. Gemini AI Ingestion Route
// app.post('/api/submit', async (req, res) => {
//   try {
//     const { text } = req.body;
//     const structuredData = await processCitizenSubmission(text);
//     res.status(200).json({ success: true, data: structuredData });
//   } catch (error) {
//     console.error("Gemini Error:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // 2. Python ML Clustering Route
// app.post('/api/cluster', (req, res) => {
//   const grievances = req.body.grievances;
//   const pythonProcess = spawn('python3', ['../ml-engine/clustering.py']);

//   let resultData = '';
//   pythonProcess.stdin.write(JSON.stringify(grievances));
//   pythonProcess.stdin.end();

//   pythonProcess.stdout.on('data', (data) => { resultData += data.toString(); });
  
//   pythonProcess.on('close', (code) => {
//     if (code !== 0) return res.status(500).json({ error: "Clustering failed" });
//     try {
//       res.status(200).json(JSON.parse(resultData));
//     } catch (e) {
//       res.status(500).json({ error: "Invalid JSON from Python script" });
//     }
//   });
// });

// const PORT = 5000;
// app.listen(PORT, () => console.log(`JanPulse API Gateway active on port ${PORT}`));
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import { telemetryMiddleware } from './middleware/logger.js';
import apiRoutes from './routes/apiRoutes.js';

const app = express();

// 1. CORS MUST BE FIRST (The Bouncer)
app.use(cors({
  origin: ['http://localhost:5173', 'https://janpulseai-gilt.vercel.app'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// 2. Body Parser
app.use(express.json({ limit: '50mb' }));

// 3. Connect to MongoDB Data Lake
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Telemetry Connected"))
  .catch(err => console.error("MongoDB Connection Failed:", err));

// 4. Apply the telemetry interceptor 
app.use(telemetryMiddleware);

// 5. Mount Routes
app.use('/api', apiRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`JanPulse API Gateway active on port ${PORT}`));