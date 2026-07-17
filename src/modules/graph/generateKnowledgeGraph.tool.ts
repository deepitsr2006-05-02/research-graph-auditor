import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';

export class GenerateKnowledgeGraphTool {

  @Tool({
    name: 'generate_knowledge_graph',
    description: 'Generate a simple knowledge graph from research paper text',
    inputSchema: z.object({
      paper_text: z.string().describe('Research paper text')
    }),
    examples: {
      request: {
        paper_text: 'Artificial Intelligence improves healthcare using machine learning.'
      },
      response: {
        status: 'success',
        nodes: [
          'Artificial',
          'Intelligence',
          'Healthcare',
          'Machine',
          'Learning'
        ],
        edges: [
          {
            source: 'Artificial',
            target: 'Intelligence'
          },
          {
            source: 'Healthcare',
            target: 'Machine'
          }
        ]
      }
    }
  })
  async generate(input: any, ctx: ExecutionContext) {

    ctx.logger.info('Generating knowledge graph');

    const words = input.paper_text
      .match(/[A-Z][a-zA-Z]+/g) || [];

    const uniqueNodes = [...new Set(words)];

    const edges = [];

    for (let i = 0; i < uniqueNodes.length - 1; i++) {
      edges.push({
        source: uniqueNodes[i],
        target: uniqueNodes[i + 1]
      });
    }

    return {
      status: 'success',
      node_count: uniqueNodes.length,
      edge_count: edges.length,
      nodes: uniqueNodes,
      edges
    };
  }
}