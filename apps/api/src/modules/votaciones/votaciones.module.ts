import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidatoEntity, VotacionEntity, VotanteEntity } from '@servel/database';
import { VotacionesController } from './votaciones.controller';
import { VotacionesService } from './votaciones.service';

@Module({
  imports: [TypeOrmModule.forFeature([VotacionEntity, CandidatoEntity, VotanteEntity])],
  controllers: [VotacionesController],
  providers: [VotacionesService],
  exports: [VotacionesService],
})
export class VotacionesModule {}
