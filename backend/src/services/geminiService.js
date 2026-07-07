import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function processCitizenSubmission(rawText) {
  const systemInstruction = `
    You are an AI Chief Development Officer parsing citizen grievances for an Indian MP.
    Analyze the text provided and return a structured JSON response exactly matching this schema:
    {
      "category": "Water Supply" | "Roads & Transport" | "Education" | "Healthcare" | "Electricity" | "Waste Management",
      "standardized_summary": "Clear, objective summary in English",
      "location": "Specific village, ward, or district named",
      "urgency_score": a number from 1-100,
      "sentiment": "Critical" | "Urgent" | "Routine"
    }
    Ensure the output contains ONLY valid JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: rawText,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text);
}