import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function processCitizenSubmission(rawText) {
  const systemInstruction = `
    You are an AI Chief Development Officer parsing citizen grievances. 
    Users will often submit multiple different complaints in a single paragraph.
    You must split these distinct issues and return a JSON ARRAY of objects. 
    Each object must match this schema exactly:
    [
      {
        "category": "Water Supply" | "Roads & Transport" | "Education" | "Healthcare" | "Electricity" | "Waste Management" | "Other",
        "standardized_summary": "Clear, objective English summary of this specific issue",
        "location": "Specific village, ward, or district named. Infer if unstated.",
        "urgency_score": a number from 1-100,
        "sentiment": "Critical" | "Urgent" | "Routine"
      }
    ]
    Ensure the output contains ONLY a valid, parseable JSON array. No markdown, no intro text.
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