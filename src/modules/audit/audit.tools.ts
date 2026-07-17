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

interface Conflict {
  topic: string;
  claim1: string;
  paper1Id: string;
  paper1Title: string;
  paper1ImageUrl: string;
  claim2: string;
  paper2Id: string;
  paper2Title: string;
  paper2ImageUrl: string;
  conflictDescription: string;
}

interface Gap {
  claim: string;
  paperId: string;
  paperTitle: string;
  paperImageUrl: string;
  gapDescription: string;
  suggestedCitations: string[];
}

/**
 * Audit Tools
 * 
 * Tools for detecting conflicts and gaps in research papers
 */
@Injectable()
export class AuditTools {
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
      // Fixtures not available
    }
  }

  @Tool({
    name: 'find-conflicts',
    description: 'Find conflicting claims about a specific topic across the research collection',
    inputSchema: z.object({
      topic: z.string().describe('The topic to search for conflicts (e.g., "carbon sequestration", "renewable energy")'),
    }),
  })
  @Widget('conflict-report')
  async findConflicts(input: { topic: string }, context: ExecutionContext) {
    context.logger.info(`Finding conflicts about topic: ${input.topic}`);
    
    const conflicts: Conflict[] = [];
    const topicLower = input.topic.toLowerCase();
    
    // Find papers discussing the topic
    const relevantPapers: Paper[] = [];
    for (const paper of this.papers.values()) {
      const titleMatch = paper.title.toLowerCase().includes(topicLower);
      const abstractMatch = paper.abstract.toLowerCase().includes(topicLower);
      const claimsMatch = paper.claims.some(c => c.toLowerCase().includes(topicLower));
      
      if (titleMatch || abstractMatch || claimsMatch) {
        relevantPapers.push(paper);
      }
    }
    
    // Find conflicting claims
    for (let i = 0; i < relevantPapers.length; i++) {
      for (let j = i + 1; j < relevantPapers.length; j++) {
        const paper1 = relevantPapers[i];
        const paper2 = relevantPapers[j];
        
        // Find claims about the topic
        const claims1 = paper1.claims.filter(c => c.toLowerCase().includes(topicLower));
        const claims2 = paper2.claims.filter(c => c.toLowerCase().includes(topicLower));
        
        // Create conflicts for different claims
        for (const claim1 of claims1) {
          for (const claim2 of claims2) {
            if (claim1 !== claim2) {
              conflicts.push({
                topic: input.topic,
                claim1,
                paper1Id: paper1.id,
                paper1Title: paper1.title,
                paper1ImageUrl: paper1.imageUrl,
                claim2,
                paper2Id: paper2.id,
                paper2Title: paper2.title,
                paper2ImageUrl: paper2.imageUrl,
                conflictDescription: `${paper1.title} claims "${claim1}" while ${paper2.title} claims "${claim2}"`,
              });
            }
          }
        }
      }
    }
    
    context.logger.info(`Found ${conflicts.length} conflicts about ${input.topic}`);
    
    return {
      success: true,
      topic: input.topic,
      conflictCount: conflicts.length,
      conflicts: conflicts.slice(0, 10), // Return top 10 conflicts
    };
  }

  @Tool({
    name: 'detect-gaps',
    description: 'Detect unsupported claims and missing citations in the research collection',
    inputSchema: z.object({
      paperId: z.string().optional().describe('Optional specific paper ID to analyze. If not provided, analyzes all papers.'),
    }),
  })
  async detectGaps(input: { paperId?: string }, context: ExecutionContext) {
    context.logger.info('Detecting gaps in research collection');
    
    const gaps: Gap[] = [];
    
    // Get papers to analyze
    const papersToAnalyze = input.paperId 
      ? [this.papers.get(input.paperId)].filter(Boolean) as Paper[]
      : Array.from(this.papers.values());
    
    for (const paper of papersToAnalyze) {
      // Get citations for this paper
      const outgoingCitations = this.citations.filter(c => c.source === paper.id);
      const citedPaperIds = new Set(outgoingCitations.map(c => c.target));
      
      // Analyze each claim
      for (const claim of paper.claims) {
        // Check if claim is supported by citations
        let isSupported = false;
        
        // Simple heuristic: if claim mentions specific numbers or percentages, it should be cited
        if (/\d+%|\d+\s*(tons|degrees|ppm|billion|million)/.test(claim)) {
          isSupported = citedPaperIds.size > 0;
        }
        
        if (!isSupported && citedPaperIds.size === 0) {
          // Find papers that might support this claim
          const suggestedCitations: string[] = [];
          for (const otherPaper of this.papers.values()) {
            if (otherPaper.id !== paper.id) {
              const claimWords = claim.toLowerCase().split(/\s+/);
              const titleWords = otherPaper.title.toLowerCase().split(/\s+/);
              const matchCount = claimWords.filter(w => titleWords.includes(w)).length;
              
              if (matchCount >= 2) {
                suggestedCitations.push(otherPaper.id);
              }
            }
          }
          
          gaps.push({
            claim,
            paperId: paper.id,
            paperTitle: paper.title,
            paperImageUrl: paper.imageUrl,
            gapDescription: `Claim "${claim}" in "${paper.title}" lacks supporting citations`,
            suggestedCitations: suggestedCitations.slice(0, 3),
          });
        }
      }
    }
    
    context.logger.info(`Detected ${gaps.length} gaps in research collection`);
    
    return {
      success: true,
      gapCount: gaps.length,
      gaps: gaps.slice(0, 10), // Return top 10 gaps
    };
  }
}
