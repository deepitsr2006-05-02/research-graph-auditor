import { Module } from '@nitrostack/core';
import { AuditTools } from './audit.tools';

@Module({
  name: 'audit',
  description: 'Research paper audit',
  controllers: [AuditTools]
})
export class AuditModule {}