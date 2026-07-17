import { ToolDecorator as Tool, Widget, z, ExecutionContext, Injectable } from '@nitrostack/core';
import { readFileSync } from 'fs';
import { join } from 'path';

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
    name: 'upload-papers',
    description: 'Upload research papers and extract metadata including title, authors, abstract, and claims',
    inputSchema: z.object({
      filenames: z.array(z.string()).describe('List of paper filenames to upload (e.g., ["climate_change_2026.pdf", "carbon_sequestration_study.pdf"])'),
    }),
  })
  async uploadPapers(input: { filenames: string[] }, context: ExecutionContext) {
    context.logger.info(`Uploading ${input.filenames.length} papers`);
    
    // Extract paper IDs from filenames and load from fixtures
    const uploadedPapers: Paper[] = [];
    
    for (const filename of input.filenames) {
      // Map filenames to paper IDs from fixtures
      let paper: Paper | undefined;
      
      if (filename.includes('climate')) {
        paper = this.papers.get('paper_001');
      } else if (filename.includes('carbon')) {
        paper = this.papers.get('paper_002');
      } else if (filename.includes('renewable')) {
        paper = this.papers.get('paper_003');
      } else if (filename.includes('ocean')) {
        paper = this.papers.get('paper_004');
      } else if (filename.includes('methane')) {
        paper = this.papers.get('paper_005');
      } else if (filename.includes('forest')) {
        paper = this.papers.get('paper_006');
      } else if (filename.includes('tipping')) {
        paper = this.papers.get('paper_007');
      } else if (filename.includes('energy')) {
        paper = this.papers.get('paper_008');
      } else if (filename.includes('pricing')) {
        paper = this.papers.get('paper_009');
      } else if (filename.includes('biodiversity')) {
        paper = this.papers.get('paper_010');
      } else if (filename.includes('hydrogen')) {
        paper = this.papers.get('paper_011');
      } else if (filename.includes('adaptation')) {
        paper = this.papers.get('paper_012');
      }
      
      if (paper) {
        uploadedPapers.push(paper);
      }
    }
    
    context.logger.info(`Successfully extracted metadata from ${uploadedPapers.length} papers`);
    
    return {
      success: true,
      count: uploadedPapers.length,
      papers: uploadedPapers.map(p => ({
        id: p.id,
        title: p.title,
        authors: p.authors,
        abstract: p.abstract,
        year: p.year,
        claims: p.claims,
      })),
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
