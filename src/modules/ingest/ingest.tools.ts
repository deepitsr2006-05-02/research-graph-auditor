import { GeminiService } from "./gemini.service.js";
import { PdfService } from "./pdf.service.js";

import {
  ToolDecorator as Tool,
  Widget,
  z,
  ExecutionContext,
  Injectable,
} from "@nitrostack/core";

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
} from "fs";

import { join } from "path";
import { randomUUID } from "crypto";
interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  year: number;
  imageUrl: string;
  claims: string[];
}

interface Citation {
  source: string;
  target: string;
  reason: string;
}

interface GraphNode {
  id: string;
  label: string;
  title: string;
  imageUrl: string;
  authors: string[];
}

interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Ingest Tools
 * 
 * Tools for uploading research papers and building citation networks
 */
@Injectable()
export class IngestTools {
  private gemini = new GeminiService();
  private pdf = new PdfService();
  private papers: Map<string, Paper> = new Map();
  private citations: Citation[] = [];

  constructor() {
    this.loadFixtures();
  }

  private loadFixtures() {
    try {
      const papersPath = join(process.cwd(), 'fixtures', 'papers.json');
      const citationsPath = join(process.cwd(), 'fixtures', 'citations.json');
      
      const papersData = JSON.parse(readFileSync(papersPath, 'utf-8')) as Paper[];
      const citationsData = JSON.parse(readFileSync(citationsPath, 'utf-8')) as Citation[];
      
      papersData.forEach(paper => {
        this.papers.set(paper.id, paper);
      });
      this.citations = citationsData;
    } catch (error) {
      // Fixtures not available, will be populated via upload-papers
    }
  }

  
  @Tool({
  name: "upload-papers",
  description: "Upload and analyze a research paper",
  inputSchema: z.object({
    file_name: z.string(),
    file_type: z.string(),
    file_content: z.string(),
  }),
})
async uploadPapers(input: any, context: ExecutionContext) {

  const uploadDir = join(process.cwd(), "uploads");

  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir);
  }

  const matches =
    input.file_content.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);

  const buffer =
    matches && matches.length === 3
      ? Buffer.from(matches[2], "base64")
      : Buffer.from(input.file_content, "base64");

  const filename = `${crypto.randomUUID()}.pdf`;
  const pdfPath = join(uploadDir, filename);

  writeFileSync(pdfPath, buffer);

  context.logger.info("Extracting PDF text...");

  const text = await this.pdf.extractText(pdfPath);

  context.logger.info("Sending to Gemini...");

  const response = await this.gemini.summarizePaper(text);

if (!response) {
  throw new Error("Gemini returned an empty response.");
}

const metadata = JSON.parse(response);

  const id = crypto.randomUUID();

  this.papers.set(id, {
    id,
    title: metadata.title,
    authors: metadata.authors,
    abstract: metadata.summary,
    year: new Date().getFullYear(),
    imageUrl: "",
    claims: metadata.claims,
  });

  return {
    success: true,
    paper: {
      id,
      ...metadata,
    },
  };
}

  @Tool({
    name: 'build-graph',
    description: 'Build a citation network graph from uploaded papers showing how they reference each other',
    inputSchema: z.object({
      paperIds: z.array(z.string()).optional().describe('Optional list of paper IDs to include. If not provided, uses all uploaded papers.'),
    }),
  })
  @Widget('graph-view')
  async buildGraph(input: { paperIds?: string[] }, context: ExecutionContext) {
    context.logger.info('Building citation network graph');
    
    // Use provided paper IDs or all papers
    const paperIds = input.paperIds && input.paperIds.length > 0 
      ? input.paperIds 
      : Array.from(this.papers.keys());
    
    // Build nodes from papers
    const nodes: GraphNode[] = [];
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
    
    // Build edges from citations
    const edges: GraphEdge[] = [];
    for (const citation of this.citations) {
      if (paperIds.includes(citation.source) && paperIds.includes(citation.target)) {
        edges.push({
          source: citation.source,
          target: citation.target,
          label: citation.reason,
        });
      }
    }
    
    const graphData: GraphData = {
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
}
