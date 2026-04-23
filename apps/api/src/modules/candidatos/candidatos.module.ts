import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidatoEntity, VotacionEntity } from '@servel/database';
import { CandidatosController } from './candidatos.controller';
import { CandidatosService } from './candidatos.service';

@Module({
  imports: [TypeOrmModule.forFeature([VotacionEntity, CandidatoEntity])],
  controllers: [CandidatosController],
  providers: [CandidatosService],
})
export class CandidatosModule {}
