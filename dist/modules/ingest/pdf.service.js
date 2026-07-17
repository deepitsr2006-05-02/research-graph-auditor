import fs from "fs";
import { PDFParse } from "pdf-parse";
export class PdfService {
    async extractText(filePath) {
        const buffer = fs.readFileSync(filePath);
        const parser = new PDFParse({
            data: buffer,
        });
        const result = await parser.getText();
        await parser.destroy();
        return result.text;
    }
}
//# sourceMappingURL=pdf.service.js.map