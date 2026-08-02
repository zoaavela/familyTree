import { Module } from '@nestjs/common';
import { TreesService } from './trees.service';
import { TreesController } from './trees.controller';

@Module({
  providers: [TreesService],
  controllers: [TreesController]
})
export class TreesModule {}
