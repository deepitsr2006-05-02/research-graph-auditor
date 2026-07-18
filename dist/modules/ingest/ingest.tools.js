var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { GeminiService } from "./gemini.service.js";
import { PdfService } from "./pdf.service.js";
import { ToolDecorator as Tool, Widget, z, Injectable, } from "@nitrostack/core";
import { readFileSync, writeFileSync, mkdirSync, existsSync, } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
/**
 * Ingest Tools
 *
 * Tools for uploading research papers and building citation networks
 */
let IngestTools = class IngestTools {
    gemini = new GeminiService();
    pdf = new PdfService();
    papers = new Map();
    relationships = [];
    constructor() {
        this.loadFixtures();
    }
    loadFixtures() {
        try {
            const papersPath = join(process.cwd(), "fixtures", "papers.json");
            const citationsPath = join(process.cwd(), "fixtures", "citations.json");
            const papersData = JSON.parse(readFileSync(papersPath, "utf-8"));
            papersData.forEach((paper) => {
                this.papers.set(paper.id, paper);
            });
            const citationsData = JSON.parse(readFileSync(citationsPath, "utf-8"));
            this.relationships = citationsData.map((citation) => ({
                source: citation.source,
                target: citation.target,
                type: "related",
                confidence: 0.95,
                explanation: citation.reason,
            }));
        }
        catch (error) {
            console.log("No fixtures loaded");
        }
    }
    async uploadPapers(input, context) {
        const uploadDir = join(process.cwd(), "uploads");
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir);
        }
        const matches = input.file_content.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        const buffer = matches && matches.length === 3
            ? Buffer.from(matches[2], "base64")
            : Buffer.from(input.file_content, "base64");
        const filename = `${randomUUID()}.pdf`;
        const pdfPath = join(uploadDir, filename);
        writeFileSync(pdfPath, buffer);
        context.logger.info("Extracting PDF text...");
        const text = await this.pdf.extractText(pdfPath);
        context.logger.info("Sending to Gemini...");
        const response = await this.gemini.summarizePaper(text);
        if (!response) {
            throw new Error("Gemini returned an empty response.");
        }
        const cleaned = response
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
        const metadata = JSON.parse(cleaned);
        const id = randomUUID();
        this.papers.set(id, {
            id,
            title: metadata.title,
            authors: metadata.authors,
            abstract: metadata.summary,
            year: new Date().getFullYear(),
            imageUrl: "",
            claims: metadata.claims,
        });
        const currentPaper = this.papers.get(id);
        for (const paper of this.papers.values()) {
            if (paper.id === currentPaper.id) {
                continue;
            }
            context.logger.info(`Comparing "${currentPaper.title}" with "${paper.title}"`);
            const response = await this.gemini.comparePapersXYZ(currentPaper, paper);
            const cleaned = response
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();
            const relation = JSON.parse(cleaned);
            const exists = this.relationships.some((r) => (r.source === currentPaper.id && r.target === paper.id) ||
                (r.source === paper.id && r.target === currentPaper.id));
            if (!exists) {
                this.relationships.push({
                    source: currentPaper.id,
                    target: paper.id,
                    type: relation.relationship,
                    confidence: relation.confidence,
                    explanation: relation.reason,
                });
            }
        }
        return {
            success: true,
            paper: {
                id,
                ...metadata,
            },
        };
    }
    async buildGraph(input, context) {
        context.logger.info('Building citation network graph');
        // Use provided paper IDs or all papers
        const paperIds = input.paperIds && input.paperIds.length > 0
            ? input.paperIds
            : Array.from(this.papers.keys());
        // Build nodes from papers
        const nodes = [];
        for (const paperId of paperIds) {
            const paper = this.papers.get(paperId);
            if (paper) {
                nodes.push({
                    id: paper.id,
                    label: paper.title.substring(0, 30) + (paper.title.length > 30 ? '...' : ''),
                    title: paper.title,
                    imageUrl: paper.imageUrl,
                    authors: paper.authors,
                });
            }
        }
        // Build edges from relationships
        const edges = [];
        for (const relation of this.relationships) {
            if (paperIds.includes(relation.source) &&
                paperIds.includes(relation.target)) {
                edges.push({
                    source: relation.source,
                    target: relation.target,
                    label: relation.type,
                    confidence: relation.confidence,
                    explanation: relation.explanation,
                });
            }
        }
        const graphData = {
            nodes,
            edges,
        };
        context.logger.info(`Graph built with ${nodes.length} nodes and ${edges.length} edges`);
        return {
            success: true,
            graph: graphData,
            nodeCount: nodes.length,
            edgeCount: edges.length,
        };
    }
};
__decorate([
    Tool({
        name: "upload-papers",
        description: "Upload and analyze a research paper",
        inputSchema: z.object({
            file_name: z.string(),
            file_type: z.string(),
            file_content: z.string(),
        }),
    }),
    Widget("upload"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IngestTools.prototype, "uploadPapers", null);
__decorate([
    Tool({
        name: 'build-graph',
        description: 'Build a citation network graph from uploaded papers showing how they reference each other',
        inputSchema: z.object({
            paperIds: z.array(z.string()).optional().describe('Optional list of paper IDs to include. If not provided, uses all uploaded papers.'),
        }),
    }),
    Widget('graph-view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IngestTools.prototype, "buildGraph", null);
IngestTools = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], IngestTools);
export { IngestTools };
//# sourceMappingURL=ingest.tools.js.map