import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TreesModule } from './trees/trees.module';
import { PersonsModule } from './persons/persons.module';
import { RelationshipsModule } from './relationships/relationships.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    TreesModule,
    PersonsModule,
    RelationshipsModule,
    MediaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }