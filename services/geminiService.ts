
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getFinancialAdvice = async (transactions: Transaction[]) => {
  if (!process.env.API_KEY) return "AI Insights unavailable without API Key.";

  const summary = transactions.reduce((acc: any, t) => {
    acc[t.type] = (acc[t.type] || 0) + t.amount;
    return acc;
  }, {});

  const prompt = `
    Based on these transactions (all in Bangladeshi Taka ৳):
    - Income: ${summary.INCOME || 0}
    - Expense: ${summary.EXPENSE || 0}
    - Bills: ${summary.BILL || 0}
    - Debt (Haoalat): ${summary.DEBT || 0}
    
    Provide a 2-sentence financial advice in Bengali.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No insights available.";
  } catch (error) {
    console.error("Gemini error:", error);
    return "সরল পরামর্শ: খরচ কমান এবং সঞ্চয় বাড়ান।";
  }
};
