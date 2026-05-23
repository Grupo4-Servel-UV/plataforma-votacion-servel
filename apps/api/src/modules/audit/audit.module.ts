import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminLogEntity, SistemaLogEntity, VotanteLogEntity } from '@servel/database';
import { AuditService } from './audit.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([VotanteLogEntity, AdminLogEntity, SistemaLogEntity])],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
