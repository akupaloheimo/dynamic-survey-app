import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY, // You'll need to add this environment variable
  dangerouslyAllowBrowser: true,
});

async function openai(input) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-5-mini-2025-08-07",
      messages: [
        {
          role: "user",
          content: input,
        },
      ],
      max_tokens: 150, // Adjust as needed
      temperature: 0.7, // Adjust for creativity level
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}

export default openai;
