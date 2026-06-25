import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminLogEntity, SistemaLogEntity, VotanteLogEntity } from '@servel/database';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([VotanteLogEntity, AdminLogEntity, SistemaLogEntity])],
  controllers: [LogsController],
  providers: [LogsService],
})
export class LogsModule {}
