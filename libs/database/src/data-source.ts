import { DataSource } from 'typeorm';
import { CandidatoEntity } from './entities/candidato.entity';
import { VotacionEntity } from './entities/votacion.entity';
import { ComunidadVotacionEntity } from './entities/comunidad-votacion.entity';
import { VotanteEntity } from './entities/votante.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.URL_DB,
  entities: [VotacionEntity, CandidatoEntity, ComunidadVotacionEntity, VotanteEntity, require('./entities/votante-otp.entity').VotanteOtpEntity],
  migrations: [__dirname + '/migrations/*.ts'],
  synchronize: false,
});
