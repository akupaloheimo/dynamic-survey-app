import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
  apiKey: process.env.REACT_APP_GEMINI_API_KEY,
});

async function gemini(input) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview", // or "gemini-2.5-flash"
    contents: input,
  });
  console.log(response.text);
  return response.text;
}

export default gemini;
