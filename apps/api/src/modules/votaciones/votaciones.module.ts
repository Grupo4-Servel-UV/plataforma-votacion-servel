import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidatoEntity, VotacionEntity, VotanteEntity, ParticipacionEntity, VotoEntity } from '@servel/database';
import { VotacionesController } from './votaciones.controller';
import { VotacionesService } from './votaciones.service';

@Module({
  imports: [TypeOrmModule.forFeature([VotacionEntity, CandidatoEntity, VotanteEntity, ParticipacionEntity, VotoEntity])],
  controllers: [VotacionesController],
  providers: [VotacionesService],
  exports: [VotacionesService],
})
export class VotacionesModule {}
