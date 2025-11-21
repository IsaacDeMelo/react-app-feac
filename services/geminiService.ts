import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";

// Ensure process is defined (handled by vite.config.ts in build, but good for safety)
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: apiKey });

// -- Chat Service --
export const createChatSession = (modelName: string = 'gemini-2.5-flash') => {
  // Fallback mock if no key is present (prevents crash in demo mode)
  if (!apiKey) {
    console.warn("No API Key found. Chat will not function correctly.");
  }

  return ai.chats.create({
    model: modelName,
    config: {
      systemInstruction: "You are a helpful, concise, and expert AI assistant.",
    },
  });
};

export const sendMessageStream = async (chat: Chat, message: string) => {
  if (!apiKey) {
    // Return a mock generator if no key to avoid API error
    async function* mockGenerator() {
      yield { text: "⚠️ **Modo de Demonstração**: Chave de API não configurada.\n\nPara ativar a inteligência artificial, configure a `API_KEY` no painel do Render." } as any;
    }
    return mockGenerator();
  }
  return await chat.sendMessageStream({ message });
};

// -- Vision Service --
export const analyzeImage = async (base64Image: string, prompt: string) => {
  if (!apiKey) return "⚠️ API Key ausente. Configure no Render para usar a visão computacional.";

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
  if (!apiKey) return { text: "⚠️ API Key ausente.", groundingChunks: [] };

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