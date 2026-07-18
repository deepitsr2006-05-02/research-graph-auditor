import { Module } from '@nitrostack/core';
import { UploadPaperTool } from './uploadPaper.tool.js';
import { SearchPaperTool } from './searchPaper.tool.js';

@Module({
  name: 'paper',
  description: 'Research paper management',
  controllers: [UploadPaperTool, SearchPaperTool]
})
export class PaperModule {}