import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import * as fs from 'fs';
import * as path from 'path';

export class SearchPaperTool {

  @Tool({
    name: 'search_paper',
    description: 'Search uploaded research papers by filename',
    inputSchema: z.object({
      keyword: z.string().describe('Keyword to search for')
    }),
    examples: {
      request: {
        keyword: 'AI'
      },
      response: {
        status: 'success',
        keyword: 'AI',
        count: 1,
        papers: [
          'AI_Research.pdf'
        ]
      }
    }
  })
  async searchPaper(input: any, ctx: ExecutionContext) {

    ctx.logger.info('Searching papers', {
      keyword: input.keyword
    });

    const uploadsDir = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(uploadsDir)) {
      return {
        status: 'failed',
        message: 'Uploads folder not found.',
        papers: []
      };
    }

    const files = fs.readdirSync(uploadsDir);

    const matches = files.filter(file =>
      file.toLowerCase().includes(input.keyword.toLowerCase())
    );

    return {
      status: 'success',
      keyword: input.keyword,
      count: matches.length,
      papers: matches
    };
  }
}