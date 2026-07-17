import { ExecutionContext } from '@nitrostack/core';
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
export declare class AuditTools {
    private papers;
    private citations;
    constructor();
    private loadFixtures;
    findConflicts(input: {
        topic: string;
    }, context: ExecutionContext): Promise<{
        success: boolean;
        topic: string;
        conflictCount: number;
        conflicts: Conflict[];
    }>;
    detectGaps(input: {
        paperId?: string;
    }, context: ExecutionContext): Promise<{
        success: boolean;
        gapCount: number;
        gaps: Gap[];
    }>;
}
export {};
//# sourceMappingURL=audit.tools.d.ts.map