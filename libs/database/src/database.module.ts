import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidatoEntity } from './entities/candidato.entity';
import { VotacionEntity } from './entities/votacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VotacionEntity, CandidatoEntity])],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
