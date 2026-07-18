import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
export class GeminiService {
    ai;
    constructor() {
        console.log("GEMINI_API_KEY =", process.env.GEMINI_API_KEY);
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY not found");
        }
        this.ai = new GoogleGenAI({ apiKey });
    }
    async summarizePaper(text) {
        const response = await this.ai.models.generateContent({
            model: "gemini-flash-latest",
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
`,
        });
        const result = response.text;
        if (!result) {
            throw new Error("Gemini returned an empty response.");
        }
        return result;
    }
    async comparePapersXYZ(paperA, paperB) {
        const response = await this.ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: `
Compare these two research papers.

Paper A
Title:
${paperA.title}

Summary:
${paperA.abstract}

Claims:
${paperA.claims.join("\n")}

--------------------------------

Paper B
Title:
${paperB.title}

Summary:
${paperB.abstract}

Claims:
${paperB.claims.join("\n")}

Return ONLY valid JSON.

{
  "relationship": "supports | contradicts | extends | related",
  "confidence": 0.95,
  "reason": ""
}
`,
        });
        const result = response.text;
        if (!result) {
            throw new Error("Gemini returned an empty response.");
        }
        return result;
    }
    testMethod() {
        return "hello";
    }
}
//# sourceMappingURL=gemini.service.js.map