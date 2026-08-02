import { Module } from '@nestjs/common';
import { RelationshipsService } from './relationships.service';
import { RelationshipsController } from './relationships.controller';

@Module({
  providers: [RelationshipsService],
  controllers: [RelationshipsController]
})
export class RelationshipsModule {}
