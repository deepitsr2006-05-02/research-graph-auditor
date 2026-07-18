import fs from "fs";
import { IngestTools } from "./src/modules/ingest/ingest.tools.js";

const pdf = fs.readFileSync("./IJNRD2404120.pdf");

const tool = new IngestTools();

const result = await tool.uploadPapers(
  {
    file_name: "IJNRD2404120.pdf",
    file_type: "application/pdf",
    file_content: pdf.toString("base64"),
  },
  {
    logger: {
      info: console.log,
      warn: console.warn,
      error: console.error,
    },
  } as any
);

console.log(result);