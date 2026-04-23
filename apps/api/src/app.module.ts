import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource, DatabaseModule } from '@servel/database';
import { CandidatosModule } from './modules/candidatos/candidatos.module';
import { VotacionesModule } from './modules/votaciones/votaciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      autoLoadEntities: true,
      synchronize: true,
    }),
    DatabaseModule,
    VotacionesModule,
    CandidatosModule,
  ],
})
export class AppModule {}
