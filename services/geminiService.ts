import { GoogleGenAI, Type, Modality } from "@google/genai";
import { NutritionData, ChatMessage } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes a food image to provide nutritional breakdown.
 * Uses gemini-3-pro-preview for complex reasoning.
 */
export const analyzeFoodImage = async (
  base64Image: string,
  age: number
): Promise<NutritionData> => {
  try {
    const mimeType = base64Image.startsWith("data:image/png") ? "image/png" : "image/jpeg";
    // Strip prefix if present for the API call if strictly needed, but inlineData usually handles it.
    // However, the SDK expects just the base64 string usually if passing raw data, 
    // or we can pass the full string if handled correctly. 
    // Let's clean the header just in case.
    const data = base64Image.split(',')[1];

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: data
            }
          },
          {
            text: `Sen uzman bir diyetisyensin. Bu yemek fotoğrafını analiz et.
            Kullanıcının yaşı: ${age}.
            Aşağıdaki formatta JSON çıktısı ver:
            1. Tahmini kalori (estimatedCalories) - sadece sayı
            2. Makro besin yüzdeleri (macros: protein, carbs, fat) - toplam 100 olmalı
            3. Tespit edilen malzemeler (ingredients) - string array
            4. Sağlık puanı (healthScore) - 1 ile 10 arası
            5. Genel analiz (analysis) - Türkçe kısa özet
            6. Yaşa özel tavsiye (ageBasedAdvice) - ${age} yaşındaki biri için bu tabak uygun mu? Türkçe öneri.
            
            Döndüreceğin JSON şeması NutritionData yapısına uygun olmalı.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedCalories: { type: Type.NUMBER },
            macros: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fat: { type: Type.NUMBER }
              },
              required: ["protein", "carbs", "fat"]
            },
            ingredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            healthScore: { type: Type.NUMBER },
            analysis: { type: Type.STRING },
            ageBasedAdvice: { type: Type.STRING }
          },
          required: ["estimatedCalories", "macros", "ingredients", "healthScore", "analysis", "ageBasedAdvice"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as NutritionData;

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

/**
 * Edits the food image based on a text prompt.
 * Uses gemini-2.5-flash-image (Nano Banana).
 */
export const editFoodImage = async (
  base64Image: string,
  prompt: string
): Promise<string> => {
  try {
    const mimeType = base64Image.startsWith("data:image/png") ? "image/png" : "image/jpeg";
    const data = base64Image.split(',')[1];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: data
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseModalities: [Modality.IMAGE]
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData && part.inlineData.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Image generation failed");

  } catch (error) {
    console.error("Image editing failed:", error);
    throw error;
  }
};

/**
 * Answers nutrition questions using Search Grounding.
 * Uses gemini-2.5-flash.
 */
export const chatWithNutritionist = async (
  query: string,
  context: string // Previous analysis context
): Promise<ChatMessage> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Bağlam: Kullanıcı az önce şu yemeği analiz etti: "${context}".
      Soru: ${query}
      Yanıtı Türkçe ver. Eğer genel beslenme bilgisi veya güncel diyet trendleri gerekiyorsa Google Search kullan.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "Üzgünüm, bir yanıt oluşturamadım.";
    
    // Extract grounding chunks if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const groundingUrls: Array<{ title: string; uri: string }> = [];

    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          groundingUrls.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
      });
    }

    return {
      id: Date.now().toString(),
      role: 'model',
      text: text,
      groundingUrls: groundingUrls.length > 0 ? groundingUrls : undefined
    };

  } catch (error) {
    console.error("Chat failed:", error);
    return {
      id: Date.now().toString(),
      role: 'model',
      text: "Üzgünüm, şu an yanıt veremiyorum. Lütfen tekrar deneyin."
    };
  }
};
