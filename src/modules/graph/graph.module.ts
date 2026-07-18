import { Module } from '@nitrostack/core';
import { GenerateKnowledgeGraphTool } from './generateKnowledgeGraph.tool';

@Module({
  name: 'graph',
  description: 'Generate a knowledge graph from research papers',
  controllers: [GenerateKnowledgeGraphTool]
})
export class GraphModule {}