
import { GoogleGenAI, Type } from "@google/genai";

export const analyzeStudySession = async (subject: string, durationMinutes: number, transcription?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this study session for a student.
    Subject: ${subject}
    Duration: ${durationMinutes} minutes
    Context: The student has been solving problems on a digital canvas.
    ${transcription ? `Note: ${transcription}` : ''}
    
    Please provide:
    1. A summary of perceived focus level.
    2. Estimated learning progress.
    3. Three specific encouraging tips for the parent to give the child.
    4. A motivational score (0-100).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            progress: { type: Type.STRING },
            tips: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            score: { type: Type.NUMBER }
          },
          required: ["summary", "progress", "tips", "score"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
};
