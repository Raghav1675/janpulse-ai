import { spawn } from 'child_process';
import { processCitizenSubmission } from '../services/geminiService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const submitGrievance = async (req, res) => {
  try {
    const { text } = req.body;
    
    // 1. Get the AI categorization from Gemini
    const structuredData = await processCitizenSubmission(text);
    
    // 2. Save the complaint AND the AI data permanently to Neon PostgreSQL
    const savedGrievance = await prisma.grievance.create({
      data: {
        raw_text: text,
        category: structuredData.category,
        location: structuredData.location,
        urgency_score: structuredData.urgency_score,
        sentiment: structuredData.sentiment,
        status: "Pending"
      }
    });

    // 3. Send the saved data back to the React frontend
    res.status(200).json({ success: true, data: savedGrievance });
  } catch (error) {
    console.error("Gemini/DB Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const clusterGrievances = (req, res) => {
  const grievances = req.body.grievances;
  
  // CHANGED: Using 'python' instead of 'python3' for Windows compatibility
const pythonProcess = spawn('./venv/bin/python', ['./ml-engine/clustering.py']);
  let resultData = '';
  let errorData = '';

  pythonProcess.stdin.write(JSON.stringify(grievances));
  pythonProcess.stdin.end();

  pythonProcess.stdout.on('data', (data) => { resultData += data.toString(); });
  
  // Capture any Python errors so they show in your terminal
  pythonProcess.stderr.on('data', (data) => { errorData += data.toString(); });

  pythonProcess.on('error', (error) => {
      console.error("Node failed to start Python:", error);
      if (!res.headersSent) res.status(500).json({ error: "Failed to start Python process" });
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
        console.error("Python Script Error:", errorData);
        if (!res.headersSent) return res.status(500).json({ error: "Clustering failed" });
    }
    try {
      if (!res.headersSent) res.status(200).json(JSON.parse(resultData));
    } catch (e) {
      if (!res.headersSent) res.status(500).json({ error: "Invalid JSON from Python script" });
    }
  });
};