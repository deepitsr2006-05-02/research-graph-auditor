import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';

export class CitationTool {

  @Tool({
    name: 'analyze_citations',
    description: 'Analyze citations in a research paper',
    inputSchema: z.object({
      paper_text: z.string()
    })
  })
  async analyze(input: any, ctx: ExecutionContext) {

    ctx.logger.info('Analyzing citations');

    const matches =
      input.paper_text.match(/[A-Z][a-zA-Z]+(?:\set\sal\.)?\s*\(\d{4}\)/g) || [];

    return {
      status: 'success',
      citation_count: matches.length,
      citations: matches
    };
  }
}