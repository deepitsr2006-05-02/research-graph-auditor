import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found");
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  async summarizePaper(text: string) {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
Analyze the following research paper and return ONLY valid JSON.

{
  "title": "",
  "authors": [],
  "summary": "",
  "keywords": [],
  "claims": []
}

Paper:
${text}
`
    });

    return response.text;
  }
}