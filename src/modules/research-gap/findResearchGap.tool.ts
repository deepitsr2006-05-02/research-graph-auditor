import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';

export class ResearchGapTool {

  @Tool({
    name: 'find_research_gaps',
    description: 'Identify research gaps from a research paper',
    inputSchema: z.object({
      paper_text: z.string().describe('Research paper text')
    })
  })
  async findGaps(input: any, ctx: ExecutionContext) {

    ctx.logger.info('Finding research gaps');

    const text = input.paper_text.toLowerCase();

    const gaps: string[] = [];

    if (text.includes('future work'))
      gaps.push('Future work section indicates possible research opportunities.');

    if (text.includes('limitation'))
      gaps.push('The paper mentions limitations that can be addressed.');

    if (text.includes('dataset'))
      gaps.push('Evaluate the approach on larger datasets.');

    if (text.includes('performance'))
      gaps.push('Improve performance in real-world environments.');

    if (gaps.length === 0)
      gaps.push('No obvious research gaps found. Manual review recommended.');

    return {
      status: 'success',
      research_gaps: gaps
    };
  }
}