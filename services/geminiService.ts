import { GoogleGenAI } from "@google/genai";

export const generateCaption = async (imageBase64: string): Promise<string> => {
  // Use process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // Clean base64 string if it contains metadata
    const cleanBase64 = imageBase64.split(',')[1] || imageBase64;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG/PNG, logic can be enhanced to detect
              data: cleanBase64
            }
          },
          {
            text: "Write a short, engaging, and aesthetic social media caption for this photo. Keep it under 15 words. Do not use hashtags."
          }
        ]
      }
    });

    return response.text?.trim() || "Beautiful moment captured.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate caption.");
  }
};