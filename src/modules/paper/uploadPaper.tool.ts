import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import * as fs from 'fs';
import * as path from 'path';

export class UploadPaperTool {

  @Tool({
    name: 'upload_paper',
    description: 'Upload and save a research paper (PDF or DOCX)',
    inputSchema: z.object({
      file_name: z.string().describe('Research paper file name'),
      file_type: z.string().describe('File MIME type'),
      file_content: z.string().describe('Base64 encoded file content')
    }),
    examples: {
      request: {
        file_name: 'AI_Research.pdf',
        file_type: 'application/pdf',
        file_content: '<base64-data>'
      },
      response: {
        status: 'success',
        message: 'Research paper uploaded successfully',
        file: {
          name: 'AI_Research.pdf',
          type: 'application/pdf',
          location: 'uploads/AI_Research.pdf'
        }
      }
    }
  })
  async uploadPaper(input: any, ctx: ExecutionContext) {

    ctx.logger.info('Uploading research paper', {
      file: input.file_name
    });

    const uploadsDir = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, input.file_name);

    try {

      let buffer: Buffer;

      const matches = input.file_content.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);

      if (matches && matches.length === 3) {
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(input.file_content, 'base64');
      }

      fs.writeFileSync(filePath, buffer);

      return {
        status: 'success',
        message: 'Research paper uploaded successfully.',
        file: {
          name: input.file_name,
          type: input.file_type,
          location: filePath,
          size: buffer.length
        }
      };

    } catch (error: any) {

      ctx.logger.error('Upload failed', {
        error: error.message
      });

      return {
        status: 'failed',
        message: error.message
      };
    }
  }
}