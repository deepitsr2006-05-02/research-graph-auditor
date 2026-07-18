import { Module } from '@nitrostack/core';
import { CitationTool } from './citation.tool';

@Module({
  name: 'citation',
  description: 'Research paper citation analysis',
  controllers: [CitationTool]
})
export class CitationModule {}