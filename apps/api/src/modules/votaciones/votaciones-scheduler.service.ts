import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { VotacionEntity } from '@servel/database';
import { EstadoVotacion } from '@servel/contracts';
import { LessThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class VotacionesSchedulerService {
  private readonly logger = new Logger(VotacionesSchedulerService.name);

  constructor(
    @InjectRepository(VotacionEntity)
    private readonly votacionRepo: Repository<VotacionEntity>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async syncEstados() {
    const now = new Date();

    const opened = await this.votacionRepo.update(
      { estado: EstadoVotacion.PENDIENTE, fechaApertura: LessThanOrEqual(now) },
      { estado: EstadoVotacion.ACTIVA },
    );
    if (opened.affected) {
      this.logger.log(`Activadas: ${opened.affected} votacion(es)`);
    }

    const closed = await this.votacionRepo.update(
      { estado: EstadoVotacion.ACTIVA, fechaCierre: LessThanOrEqual(now) },
      { estado: EstadoVotacion.CERRADA },
    );
    if (closed.affected) {
      this.logger.log(`Cerradas: ${closed.affected} votacion(es)`);
    }
  }
}
