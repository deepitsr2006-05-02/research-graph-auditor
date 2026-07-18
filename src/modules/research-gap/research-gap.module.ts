import { Module } from '@nitrostack/core';
import { ResearchGapTool } from './findResearchGap.tool';

@Module({
  name: 'research-gap',
  description: 'Identify research gaps in a paper',
  controllers: [ResearchGapTool]
})
export class ResearchGapModule {}