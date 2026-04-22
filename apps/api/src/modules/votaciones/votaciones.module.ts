import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidatoEntity, VotacionEntity } from '@servel/database';
import { VotacionesController } from './votaciones.controller';
import { VotacionesService } from './votaciones.service';

@Module({
  imports: [TypeOrmModule.forFeature([VotacionEntity, CandidatoEntity])],
  controllers: [VotacionesController],
  providers: [VotacionesService],
})
export class VotacionesModule {}
