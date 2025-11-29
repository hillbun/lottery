import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Define the response schema for strict JSON output
const lotterySchema = {
  type: Type.OBJECT,
  properties: {
    reds: {
      type: Type.ARRAY,
      items: { type: Type.INTEGER },
      description: "An array of exactly 6 unique integers between 1 and 33, sorted in ascending order."
    },
    blue: {
      type: Type.INTEGER,
      description: "A single integer between 1 and 16."
    },
    reasoning: {
      type: Type.STRING,
      description: "A short, fun fortune-teller style explanation for why these numbers were chosen based on the user's prompt."
    }
  },
  required: ["reds", "blue", "reasoning"]
};

export const generateAILuckyNumbers = async (userPrompt: string): Promise<{ reds: number[], blue: number, reasoning: string }> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a set of Double Color Ball (Union Lotto) numbers based on this context: "${userPrompt}".
      Rules: 
      1. Red balls: 6 unique numbers from 1 to 33.
      2. Blue ball: 1 number from 1 to 16.
      3. The numbers should feel "lucky" based on the user's input.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: lotterySchema,
        temperature: 1.1, // Higher temperature for more variety
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Cleanup potential Markdown
    text = text.replace(/```json\n?|\n?```/g, '').trim();

    const data = JSON.parse(text);
    
    // Validate output just in case
    const safeReds: number[] = Array.isArray(data.reds) 
      ? data.reds.slice(0, 6).map((n: any) => {
          const val = Number(n);
          return isNaN(val) ? Math.floor(Math.random() * 33) + 1 : Math.max(1, Math.min(33, val));
        }) 
      : [1,2,3,4,5,6];
      
    // Ensure uniqueness
    const uniqueReds: number[] = Array.from(new Set(safeReds));
    while(uniqueReds.length < 6) {
         let n = Math.floor(Math.random() * 33) + 1;
         if(!uniqueReds.includes(n)) uniqueReds.push(n);
    }
    const sortedReds = uniqueReds.sort((a: number, b: number) => a - b);
    
    const safeBlue = Math.max(1, Math.min(16, Number(data.blue) || Math.floor(Math.random() * 16) + 1));

    return {
      reds: sortedReds,
      blue: safeBlue,
      reasoning: data.reasoning || "Lucky numbers generated just for you!"
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};