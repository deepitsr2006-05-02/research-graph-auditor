var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ToolDecorator as Tool, Widget, z, Injectable } from '@nitrostack/core';
import { readFileSync } from 'fs';
import { join } from 'path';
/**
 * Audit Tools
 *
 * Tools for detecting conflicts and gaps in research papers
 */
let AuditTools = class AuditTools {
    papers = new Map();
    citations = [];
    constructor() {
        this.loadFixtures();
    }
    loadFixtures() {
        try {
            const papersPath = join(process.cwd(), 'fixtures', 'papers.json');
            const citationsPath = join(process.cwd(), 'fixtures', 'citations.json');
            const papersData = JSON.parse(readFileSync(papersPath, 'utf-8'));
            const citationsData = JSON.parse(readFileSync(citationsPath, 'utf-8'));
            papersData.forEach(paper => {
                this.papers.set(paper.id, paper);
            });
            this.citations = citationsData;
        }
        catch (error) {
            // Fixtures not available
        }
    }
    async findConflicts(input, context) {
        context.logger.info(`Finding conflicts about topic: ${input.topic}`);
        const conflicts = [];
        const topicLower = input.topic.toLowerCase();
        // Find papers discussing the topic
        const relevantPapers = [];
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
    async detectGaps(input, context) {
        context.logger.info('Detecting gaps in research collection');
        const gaps = [];
        // Get papers to analyze
        const papersToAnalyze = input.paperId
            ? [this.papers.get(input.paperId)].filter(Boolean)
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
                    const suggestedCitations = [];
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
};
__decorate([
    Tool({
        name: 'find-conflicts',
        description: 'Find conflicting claims about a specific topic across the research collection',
        inputSchema: z.object({
            topic: z.string().describe('The topic to search for conflicts (e.g., "carbon sequestration", "renewable energy")'),
        }),
    }),
    Widget('conflict-report'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuditTools.prototype, "findConflicts", null);
__decorate([
    Tool({
        name: 'detect-gaps',
        description: 'Detect unsupported claims and missing citations in the research collection',
        inputSchema: z.object({
            paperId: z.string().optional().describe('Optional specific paper ID to analyze. If not provided, analyzes all papers.'),
        }),
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuditTools.prototype, "detectGaps", null);
AuditTools = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], AuditTools);
export { AuditTools };
//# sourceMappingURL=audit.tools.js.map