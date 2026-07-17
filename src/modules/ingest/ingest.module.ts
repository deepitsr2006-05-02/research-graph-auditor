import { Module } from '@nitrostack/core';
import { IngestTools } from './ingest.tools.js';
import { IngestResources } from './ingest.resources.js';
import { IngestPrompts } from './ingest.prompts.js';

@Module({
  name: 'ingest',
  description: 'TODO: Add description',
  controllers: [IngestTools, IngestResources, IngestPrompts],
})
export class IngestModule {}
