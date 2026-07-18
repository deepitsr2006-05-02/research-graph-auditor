import { Module } from '@nitrostack/core';
import { SummarizePaperTool } from './summarizePaper.tool.js';

@Module({
  name: 'summary',
  description: 'Research paper summarization',
  controllers: [SummarizePaperTool]
})
export class SummaryModule {}