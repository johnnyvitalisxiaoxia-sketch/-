import { GoogleGenAI } from '@google/genai';

// For text generation, we use the default API key
export const getGenAI = () => {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

// For image generation, we use the user-selected API key
export const getUserGenAI = () => {
  // @ts-ignore - process.env.API_KEY is injected by the platform after selection
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('User API key not found. Please select an API key first.');
  }
  return new GoogleGenAI({ apiKey });
};

export async function generateImagesForAnswer(answer: string, count: number = 3): Promise<string[]> {
  const ai = getUserGenAI();
  const prompt = `Create a highly artistic, futuristic, tech-vibe, abstract illustration based on this text: "${answer.substring(0, 300)}...". The color palette MUST be strictly black and glowing red. High contrast, cinematic lighting, cyberpunk or abstract tech aesthetic.`;
  
  const promises = Array.from({ length: count }).map(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      }
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error('No image generated');
  });

  return Promise.all(promises);
}
