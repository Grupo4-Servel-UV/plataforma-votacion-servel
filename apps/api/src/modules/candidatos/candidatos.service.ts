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

  async create(payload: Partial<CandidatoEntity>): Promise<CandidatoEntity> {
    const saved = (await this.candidatoRepo.save(payload as any)) as unknown as CandidatoEntity;
    return saved;
  }

  async update(id: string, payload: Partial<CandidatoEntity>): Promise<CandidatoEntity> {
    const existing = await this.candidatoRepo.findOneBy({ id });
    if (!existing) throw new Error('Candidato no encontrado');
    Object.assign(existing, payload);
    const saved = (await this.candidatoRepo.save(existing)) as unknown as CandidatoEntity;
    return saved;
  }

  async remove(id: string): Promise<void> {
    const existing = await this.candidatoRepo.findOneBy({ id });
    if (!existing) throw new Error('Candidato no encontrado');
    if (existing.votacionId) throw new Error('Candidato asignado a una votación y no puede ser eliminado');
    await this.candidatoRepo.remove(existing);
  }
}
