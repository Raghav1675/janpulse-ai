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

export const clusterGrievances = async (req, res) => {
  try {
    // 1. Fetch all live citizen grievances from Neon PostgreSQL
    const liveGrievances = await prisma.grievance.findMany({
      orderBy: { created_at: 'desc' }
    });

    // Safety Check: If your database is completely empty, return an empty array early
    if (!liveGrievances || liveGrievances.length === 0) {
      return res.status(200).json([]);
    }

    // 2. Format the database records so the Python script expects them
    // (Python needs an array of objects containing text strings)
    const formattedGrievances = liveGrievances.map(g => ({
      id: g.id,
      text: g.raw_text,
      category: g.category,
      location: g.location,
      urgency_score: g.urgency_score,
      sentiment: g.sentiment
    }));

    // 3. Spawn the Python process using your virtual environment
    const pythonProcess = spawn('./venv/bin/python', ['./ml-engine/clustering.py']);

    let resultData = '';
    let errorData = '';

    // 4. Pipe the live database records into Python's standard input
    pythonProcess.stdin.write(JSON.stringify(formattedGrievances));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => { resultData += data.toString(); });
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
        if (!res.headersSent) {
          // 5. Send the AI-clustered live data back to your React dashboard
          res.status(200).json(JSON.parse(resultData));
        }
      } catch (e) {
        if (!res.headersSent) res.status(500).json({ error: "Invalid JSON from Python script" });
      }
    });

  } catch (dbError) {
    console.error("Database Fetch Error inside Cluster Controller:", dbError);
    res.status(500).json({ success: false, error: "Could not fetch grievances from database" });
  }
};