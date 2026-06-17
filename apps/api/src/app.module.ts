import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppDataSource, DatabaseModule } from '@servel/database';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { CandidatosModule } from './modules/candidatos/candidatos.module';
import { VotacionesModule } from './modules/votaciones/votaciones.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuditModule } from './modules/audit/audit.module';
import { LogsModule } from './modules/logs/logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      autoLoadEntities: true,
      synchronize: true,
    }),
    DatabaseModule,
    AuditModule,
    LogsModule,
    VotacionesModule,
    CandidatosModule,
    AuthModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
