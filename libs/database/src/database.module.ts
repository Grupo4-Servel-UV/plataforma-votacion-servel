import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidatoEntity } from './entities/candidato.entity';
import { VotacionEntity } from './entities/votacion.entity';
import { VotanteEntity } from './entities/votante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VotacionEntity, CandidatoEntity, VotanteEntity])],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
