import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";

// Initialize the client strictly with the process.env.API_KEY
// Note: In a real production app, ensure this is handled securely on the backend or via a proxy if possible.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// -- Chat Service --
export const createChatSession = (modelName: string = 'gemini-2.5-flash') => {
  return ai.chats.create({
    model: modelName,
    config: {
      systemInstruction: "You are a helpful, concise, and expert AI assistant.",
    },
  });
};

export const sendMessageStream = async (chat: Chat, message: string) => {
  return await chat.sendMessageStream({ message });
};

// -- Vision Service --
export const analyzeImage = async (base64Image: string, prompt: string) => {
  // Strip the data URL prefix to get raw base64
  const base64Data = base64Image.split(',')[1];
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg', // Assuming JPEG for simplicity in this demo, usually detected from file
            data: base64Data
          }
        },
        { text: prompt || "Describe this image in detail." }
      ]
    }
  });
  
  return response.text;
};

// -- Grounding (Search) Service --
export const searchWithGrounding = async (query: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: query,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  return {
    text: response.text,
    groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};