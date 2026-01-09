
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export async function explainPackage(packageName: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Explain what the Linux package "${packageName}" is, its primary use cases, and give 3 common command examples. Format in clear sections.`
  });
  return response.text;
}

export async function searchCommands(query: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The user is looking for a Linux command or tool to do: "${query}". Suggest 3 relevant packages/commands, describe them briefly, and provide the command syntax.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            command: { type: Type.STRING },
            package: { type: Type.STRING },
            description: { type: Type.STRING },
            usage: { type: Type.STRING }
          },
          required: ["command", "package", "description", "usage"]
        }
      }
    }
  });
  
  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
}

export async function suggestAlias(command: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest a short, intuitive terminal alias name and a brief description for this complex command: "${command}".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          alias: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["alias", "description"]
      }
    }
  });
  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { alias: '', description: '' };
  }
}
