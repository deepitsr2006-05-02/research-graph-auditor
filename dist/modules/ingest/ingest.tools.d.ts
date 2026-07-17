import { ExecutionContext } from '@nitrostack/core';
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
export declare class IngestTools {
    private papers;
    private citations;
    constructor();
    private loadFixtures;
    uploadPapers(input: {
        filenames: string[];
    }, context: ExecutionContext): Promise<{
        success: boolean;
        count: number;
        papers: {
            id: string;
            title: string;
            authors: string[];
            abstract: string;
            year: number;
            claims: string[];
        }[];
    }>;
    buildGraph(input: {
        paperIds?: string[];
    }, context: ExecutionContext): Promise<{
        success: boolean;
        graph: GraphData;
        nodeCount: number;
        edgeCount: number;
    }>;
}
export {};
//# sourceMappingURL=ingest.tools.d.ts.map