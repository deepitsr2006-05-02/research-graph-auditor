import { GoogleGenAI } from "@google/genai";
export class GeminiService {
    ai;
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY not found");
        }
        this.ai = new GoogleGenAI({ apiKey });
    }
    async summarizePaper(text) {
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
        const result = response.text;
        if (!result) {
            throw new Error("Gemini returned an empty response.");
        }
        return result;
    }
}
//# sourceMappingURL=gemini.service.js.map