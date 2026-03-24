import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
  apiKey: process.env.REACT_APP_GEMINI_API_KEY,
});

async function gemini(input) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: input,
    });
    console.log(response.text);
    return response.text;
  } catch (error) {
    console.warn(
      "gemini-3.1-flash-lite-preview failed, trying gemini-3-flash-preview:",
      error,
    );

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: input,
      });
      console.log(response.text);
      return response.text;
    } catch (fallbackError) {
      console.error("Both models failed:", fallbackError);
      throw fallbackError;
    }
  }
}

export default gemini;
