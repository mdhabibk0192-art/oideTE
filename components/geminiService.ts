
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

export const getFinancialAdvice = async (transactions: Transaction[]) => {
  // অ্যাপ যাতে ক্র্যাশ না করে সেজন্য API Key চেক
  if (!process.env.API_KEY) {
    return "সতর্কতা: Gemini API Key পাওয়া যায়নি। দয়া করে কনফিগারেশন চেক করুন।";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const summary = transactions.reduce((acc: any, t) => {
    acc[t.type] = (acc[t.type] || 0) + Math.abs(t.amount);
    return acc;
  }, {});

  const prompt = `
    Analyze these daily records (Bangladeshi Taka ৳):
    - Income: ${summary.INCOME || 0}
    - Expense: ${summary.EXPENSE || 0}
    - Bills: ${summary.BILL || 0}
    - Debt: ${summary.DEBT || 0}
    
    Provide 2 short sentences of simple financial advice in Bengali for a common person.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "বর্তমানে কোনো পরামর্শ নেই। আপনার ব্যয়ের হিসাব রাখুন।";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "সতর্কতা: পরামর্শ লোড করা সম্ভব হয়নি। অপচয় কমানোর চেষ্টা করুন।";
  }
};
