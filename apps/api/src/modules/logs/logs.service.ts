import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminLogEntity, SistemaLogEntity, VotanteLogEntity } from '@servel/database';
import { Repository } from 'typeorm';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(VotanteLogEntity)
    private readonly votanteLogRepo: Repository<VotanteLogEntity>,
    @InjectRepository(AdminLogEntity)
    private readonly adminLogRepo: Repository<AdminLogEntity>,
    @InjectRepository(SistemaLogEntity)
    private readonly sistemaLogRepo: Repository<SistemaLogEntity>,
  ) {}

  getVotanteLogs() {
    return this.votanteLogRepo.find({ order: { createdAt: 'DESC' }, take: 500 });
  }

  getAdminLogs() {
    return this.adminLogRepo.find({ order: { createdAt: 'DESC' }, take: 500 });
  }

  getSistemaLogs() {
    return this.sistemaLogRepo.find({ order: { createdAt: 'DESC' }, take: 500 });
  }
}
