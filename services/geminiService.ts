import { GoogleGenAI, Chat } from "@google/genai";

// Vite will replace 'process.env.API_KEY' with the actual string value during build.
// We use a try-catch fallback just in case the replacement fails in some edge case environment.
const getApiKey = (): string => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    return '';
  }
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey: apiKey });

// -- Chat Service --
export const createChatSession = (modelName: string = 'gemini-2.5-flash', customContext: string = '') => {
  if (!apiKey) {
    console.warn("No API Key found. Chat will run in DEMO mode.");
  }

  const defaultInstruction = `Você é a Luna, uma monitora acadêmica auxiliar para o curso de Administração. Fale de forma profissional, direta, objetiva e respeitosa. Evite excesso de afetividade. Fale sempre no SINGULAR, com o aluno individualmente. Se você não sabe alguma coisa, apenas diga que não sabe, mas não invente nada.`;
  
  const systemInstruction = customContext 
    ? `${defaultInstruction}\n\n${customContext}` 
    : defaultInstruction;

  return ai.chats.create({
    model: modelName,
    config: {
      systemInstruction: systemInstruction,
    },
  });
};

export const sendMessageStream = async (chat: Chat, message: string) => {
  if (!apiKey) {
    // Return a mock generator if no key to avoid API error
    async function* mockGenerator() {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      yield { text: "⚠️ **Modo de Demonstração**\n\nA Chave de API não foi detectada. \n\n**Para o Admin:** Verifique se a `API_KEY` está configurada corretamente nas Variáveis de Ambiente ou em `/etc/secrets/` no painel do Render." } as any;
    }
    return mockGenerator();
  }
  return await chat.sendMessageStream({ message });
};

// -- Vision Service --
export const analyzeImage = async (base64Image: string, prompt: string) => {
  if (!apiKey) return "⚠️ API Key ausente. Configure no Render para usar a visão computacional.";

  const base64Data = base64Image.split(',')[1];
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg', 
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