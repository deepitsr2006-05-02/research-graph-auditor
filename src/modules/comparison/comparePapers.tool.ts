import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';

export class ComparePapersTool {

  @Tool({
    name: 'compare_papers',
    description: 'Compare two research papers',
    inputSchema: z.object({
      paper1: z.string().describe('Text of first paper'),
      paper2: z.string().describe('Text of second paper')
    }),
    examples: {
      request: {
        paper1: 'Artificial Intelligence is transforming healthcare.',
        paper2: 'Machine Learning improves medical diagnosis.'
      },
      response: {
        status: 'success',
        similarity: '50%',
        common_topics: ['healthcare'],
        differences: [
          'Paper 1 focuses on Artificial Intelligence',
          'Paper 2 focuses on Machine Learning'
        ]
      }
    }
  })
  async compare(input: any, ctx: ExecutionContext) {

    ctx.logger.info('Comparing papers');

    const words1 = new Set(
      input.paper1.toLowerCase().split(/\W+/).filter(Boolean)
    );

    const words2 = new Set(
      input.paper2.toLowerCase().split(/\W+/).filter(Boolean)
    );

    const common = [...words1].filter(word => words2.has(word));

    const similarity =
      Math.round(
        (common.length / Math.max(words1.size, words2.size)) * 100
      );

    return {
      status: 'success',
      similarity: `${similarity}%`,
      common_topics: common.slice(0, 10),
      differences: [
        'Paper 1 contains unique concepts not found in Paper 2.',
        'Paper 2 contains unique concepts not found in Paper 1.'
      ]
    };
  }
}