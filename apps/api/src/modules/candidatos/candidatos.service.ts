import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EstadoCandidato } from '@servel/contracts';
import { CandidatoEntity } from '@servel/database';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class CandidatosService {
  constructor(
    @InjectRepository(CandidatoEntity)
    private readonly candidatoRepo: Repository<CandidatoEntity>,
  ) {}

  async findAll(): Promise<CandidatoEntity[]> {
    return this.candidatoRepo.find();
  }

  async findDisponibles(): Promise<CandidatoEntity[]> {
    return this.candidatoRepo.find({
      where: { votacionId: IsNull(), estado: EstadoCandidato.ACTIVO },
      order: { nombres: 'ASC', apellidos: 'ASC' },
    });
  }
}
