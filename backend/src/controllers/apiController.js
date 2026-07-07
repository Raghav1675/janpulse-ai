import { PrismaClient } from '@prisma/client';
import { processCitizenSubmission } from '../services/geminiService.js';

const prisma = new PrismaClient();

// 1. Submit & Split Multiple Grievances
export const submitGrievance = async (req, res) => {
  try {
    const { text, contactAgreed, phone } = req.body;
    
    // Gemini now returns an ARRAY of distinct issues
    const extractedIssues = await processCitizenSubmission(text);
    
    // Save every distinct issue into the Neon database as its own row
    const savedGrievances = await Promise.all(
      extractedIssues.map(async (issue) => {
        return prisma.grievance.create({
          data: {
            raw_text: text, // Keep the original context
            category: issue.category,
            location: issue.location || "Unknown",
            urgency_score: issue.urgency_score,
            sentiment: issue.sentiment,
            status: "Pending",
            contact_agreed: contactAgreed || false,
            submitter_phone: phone || null
          }
        });
      })
    );

    res.status(200).json({ success: true, data: savedGrievances });
  } catch (error) {
    console.error("Gemini/DB Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Feed the MP Dashboard (No Python needed)
export const clusterGrievances = async (req, res) => {
  try {
    const liveGrievances = await prisma.grievance.findMany({
      orderBy: { created_at: 'desc' }
    });

    // Format the database records for the React UI
    const formattedData = liveGrievances.map((g) => ({
      cluster_id: g.id,
      text: `${g.category} issue reported in ${g.location}`,
      category: g.category,
      location: g.location,
      complaint_count: 1, 
      urgency: g.urgency_score,
      status: g.status
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Database Fetch Error:", error);
    res.status(500).json({ success: false, error: "Could not fetch grievances" });
  }
};

// 3. NEW ROUTE: MP Updates Status (Pending -> Resolved)
export const updateStatus = async (req, res) => {
  try {
    const { id, newStatus } = req.body;
    const updated = await prisma.grievance.update({
      where: { id: parseInt(id) },
      data: { status: newStatus }
    });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: "Status update failed" });
  }
};