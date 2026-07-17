import { Module } from '@nitrostack/core';
import { ComparePapersTool } from './comparePapers.tool';

@Module({
  name: 'comparison',
  description: 'Compare two research papers',
  controllers: [ComparePapersTool]
})
export class ComparisonModule {}