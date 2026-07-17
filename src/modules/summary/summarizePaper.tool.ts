import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';

export class SummarizePaperTool {

  @Tool({
    name: 'summarize_paper',
    description: 'Generate a summary for a research paper',
    inputSchema: z.object({
      paper_text: z.string().describe('Extracted research paper text')
    }),
    examples: {
      request: {
        paper_text: 'Artificial Intelligence is transforming healthcare...'
      },
      response: {
        summary: 'This paper discusses the application of AI in healthcare.'
      }
    }
  })
  async summarizePaper(input: any, ctx: ExecutionContext) {

    ctx.logger.info('Generating summary');

    const text = input.paper_text;

    const summary =
      text.length > 300
        ? text.substring(0, 300) + '...'
        : text;

    return {
      status: 'success',
      summary
    };
  }
}