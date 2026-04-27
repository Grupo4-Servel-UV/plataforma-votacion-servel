import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVotacionInput, EstadoVotacion } from '@servel/contracts';
import { CandidatoEntity, VotacionEntity } from '@servel/database';
import { DataSource, In, Repository } from 'typeorm';

@Injectable()
export class VotacionesService {
  constructor(
    @InjectRepository(VotacionEntity)
    private readonly votacionRepo: Repository<VotacionEntity>,
    @InjectRepository(CandidatoEntity)
    private readonly candidatoRepo: Repository<CandidatoEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async create(input: CreateVotacionInput) {
    try {
      const nuevaVotacion = this.votacionRepo.create({
        nombre: input.nombre,
        fechaApertura: input.fechaApertura,
        fechaCierre: input.fechaCierre,
        estado: EstadoVotacion.PENDIENTE,
        comunidadIndigenaReq: input.restricciones?.comunidadIndigena,
        zonaRestriccionId: input.restricciones?.zonaId,
      });

      const votacionGuardada = await this.votacionRepo.save(nuevaVotacion);

      return {
        id: votacionGuardada.id,
        message: 'Votación registrada con exito',
        estado: votacionGuardada.estado,
      };
    } catch (error: any) {
      console.error('Error en la transacción: ', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Error al procesar el registro electoral');
    }
  }

  async asignarCandidatos(votacionId: string, candidatosIds: string[]) {
    const existeVotacion = this.votacionRepo.existsBy({ id: votacionId });
    if (!existeVotacion) {
      throw new BadRequestException('La votación no existe');
    }

    const candidatos = await this.candidatoRepo.find({
      where: { id: In(candidatosIds) },
      select: ['id', 'votacionId'],
    });
    if (candidatos.length !== candidatosIds.length) {
      throw new BadRequestException('Uno o más candidatos seleccionados no existen en el registro');
    }

    const yaAsignados = candidatos.filter(
      (candidato) => candidato.votacionId && candidato.votacionId !== votacionId,
    );
    if (yaAsignados.length > 0) {
      throw new BadRequestException('Uno o más candidatos ya están asignados a otra votación');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(CandidatoEntity, { id: In(candidatosIds) }, { votacionId });

      await queryRunner.commitTransaction();
      return {
        message: 'Candidatos asociados con exito',
        total: candidatosIds.length,
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      console.error('Error en la transacción: ', error);

      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error al procesar la asociación de candidatos');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return this.votacionRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
  return this.votacionRepo.findOne({
    where: { id },
    relations: ['candidatos'],
  });
}
}
