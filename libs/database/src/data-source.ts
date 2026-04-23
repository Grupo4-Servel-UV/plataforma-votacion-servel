import { DataSource } from 'typeorm';
import { CandidatoEntity } from './entities/candidato.entity';
import { VotacionEntity } from './entities/votacion.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.URL_DB,
  entities: [VotacionEntity, CandidatoEntity],
  migrations: [__dirname + '/migrations/*.ts'],
  synchronize: false,
});
