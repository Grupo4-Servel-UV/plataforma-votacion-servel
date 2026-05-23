import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVotacionInput, EstadoVotacion, REGLAS_NEGOCIO, UpdateVotacionInput } from '@servel/contracts';
import { CandidatoEntity, VotacionEntity, VotanteEntity, ParticipacionEntity, VotoEntity } from '@servel/database';
import { DataSource, In, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class VotacionesService {
  constructor(
    @InjectRepository(VotacionEntity)
    private readonly votacionRepo: Repository<VotacionEntity>,
    @InjectRepository(CandidatoEntity)
    private readonly candidatoRepo: Repository<CandidatoEntity>,
    @InjectRepository(VotanteEntity)
    private readonly votanteRepo: Repository<VotanteEntity>,
    @InjectRepository(ParticipacionEntity)
    private readonly participacionRepo: Repository<ParticipacionEntity>,
    @InjectRepository(VotoEntity)
    private readonly votoRepo: Repository<VotoEntity>,
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
  ) {}

  async create(input: CreateVotacionInput) {
    try {
      const nuevaVotacion = this.votacionRepo.create({
        nombre: input.nombre,
        fechaApertura: input.fechaApertura,
        fechaCierre: input.fechaCierre,
        estado: EstadoVotacion.PENDIENTE,
        region: input.restricciones?.region,
        comuna: input.restricciones?.comuna,
        comunidades: input.restricciones?.comunidadesIndigenas?.map((nombre) => ({
          comunidad: nombre,
        })),
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
    const votacion = await this.votacionRepo.findOne({
      where: { id },
      relations: ['candidatos', 'comunidades'],
    });
    if (!votacion) throw new NotFoundException('Votación no encontrada');
    return votacion;
  }

  async checkEligibility(votacionId: string, rut: string) {
    const votacion = await this.votacionRepo.findOne({
      where: { id: votacionId },
      relations: ['comunidades'],
    });
    if (!votacion) throw new NotFoundException('Votación no encontrada');

    const clean = String(rut).replace(/\.|-|\s/g, '');
    const votante = await this.votanteRepo
      .createQueryBuilder('v')
      .where("replace(replace(v.rut, '.', ''), '-', '') = :clean", { clean })
      .getOne();

    if (!votante) return { eligible: false, reasons: ['Votante no registrado'] };

    const reasons: string[] = [];

    if (votacion.region) {
      if (!votante.region || votante.region !== votacion.region) {
        reasons.push('Región no coincide');
      }
    }

    if (votacion.comuna) {
      if (!votante.comuna || votante.comuna !== votacion.comuna) {
        reasons.push('Comuna no coincide');
      }
    }

    const comunidades = (votacion as any).comunidades ?? [];
    if (Array.isArray(comunidades) && comunidades.length > 0) {
      const nombres = comunidades.map((c: any) => c.comunidad);
      const match =
        (votante.comunidadIndigena && nombres.includes(votante.comunidadIndigena)) ||
        (votante.etnia && nombres.includes(votante.etnia));
      if (!match) {
        reasons.push('No pertenece a la(s) comunidad(es) requeridas');
      }
    }

    // privacy-preserving check: derive a votante hash from the cleaned RUT
    const rutClean = clean;
    const secret = process.env.VOTANTE_HASH_SECRET ?? '';
    let votanteHash: string;
    if (secret) {
      votanteHash = crypto.createHmac('sha256', secret).update(rutClean).digest('hex');
    } else {
      // fallback to plain hash when no secret configured (not recommended for production)
      votanteHash = crypto.createHash('sha256').update(rutClean).digest('hex');
    }

    const already = await this.participacionRepo.findOne({ where: { votacionId, votanteHash } });
    if (already) {
      return { eligible: false, reasons: ['Ya ejerciste tu voto'] };
    }

    return { eligible: reasons.length === 0, reasons };
  }

  async getResultados(votacionId: string) {
    const votacion = await this.votacionRepo.findOne({
      where: { id: votacionId },
      relations: ['candidatos'],
    });
    if (!votacion) throw new NotFoundException('Votación no encontrada');
    if (votacion.estado !== EstadoVotacion.CERRADA) {
      throw new ForbiddenException('Los resultados solo están disponibles cuando la votación ha cerrado');
    }

    const blankCount = await this.votoRepo
      .createQueryBuilder('v')
      .where('v.votacionId = :votacionId', { votacionId })
      .andWhere("v.payload->>'blank' = 'true'")
      .getCount();

    const candidateVotesRaw = await this.votoRepo
      .createQueryBuilder('v')
      .select("v.payload->>'candidateId'", 'candidateId')
      .addSelect('COUNT(*)', 'votos')
      .where('v.votacionId = :votacionId', { votacionId })
      .andWhere("v.payload->>'candidateId' IS NOT NULL")
      .groupBy("v.payload->>'candidateId'")
      .getRawMany<{ candidateId: string; votos: string }>();

    const votesMap = new Map(
      candidateVotesRaw.map((r) => [r.candidateId, parseInt(r.votos, 10)]),
    );

    const totalCandidateVotes = candidateVotesRaw.reduce((sum, r) => sum + parseInt(r.votos, 10), 0);

    return {
      id: votacion.id,
      nombre: votacion.nombre,
      estado: votacion.estado,
      fechaApertura: votacion.fechaApertura,
      fechaCierre: votacion.fechaCierre,
      totalVotos: blankCount + totalCandidateVotes,
      votosBlancos: blankCount,
      candidatos: votacion.candidatos.map((c) => ({
        id: c.id,
        nombres: c.nombres,
        apellidos: c.apellidos,
        votos: votesMap.get(c.id) ?? 0,
      })),
    };
  }

  private checkLockPeriod(votacion: VotacionEntity) {
    const minMs = REGLAS_NEGOCIO.MIN_DIAS_ANTICIPACION * REGLAS_NEGOCIO.MS_POR_DIA;
    const msToOpen = votacion.fechaApertura.getTime() - Date.now();
    if (votacion.estado !== EstadoVotacion.PENDIENTE || msToOpen < minMs) {
      throw new ForbiddenException(
        `Solo se pueden modificar votaciones pendientes con al menos ${REGLAS_NEGOCIO.MIN_DIAS_ANTICIPACION} días de anticipación`,
      );
    }
  }

  async updateVotacion(id: string, input: UpdateVotacionInput) {
    const votacion = await this.votacionRepo.findOneBy({ id });
    if (!votacion) throw new NotFoundException('Votación no encontrada');
    this.checkLockPeriod(votacion);

    if (input.nombre !== undefined) votacion.nombre = input.nombre;
    if (input.fechaApertura !== undefined) votacion.fechaApertura = new Date(input.fechaApertura);
    if (input.fechaCierre !== undefined) votacion.fechaCierre = new Date(input.fechaCierre);

    await this.votacionRepo.save(votacion);
    return { id: votacion.id, message: 'Votación actualizada con éxito' };
  }

  async deleteVotacion(id: string) {
    const votacion = await this.votacionRepo.findOneBy({ id });
    if (!votacion) throw new NotFoundException('Votación no encontrada');
    this.checkLockPeriod(votacion);

    await this.votacionRepo.remove(votacion);
    return { message: 'Votación eliminada con éxito' };
  }

  async castVote(votacionId: string, rut: string, payload: any, ip = 'unknown') {
    const votacion = await this.votacionRepo.findOneBy({ id: votacionId });
    if (!votacion) throw new NotFoundException('Votación no encontrada');

    const now = new Date();
    if (now >= votacion.fechaCierre) {
      throw new ForbiddenException('El plazo de votación ha expirado');
    }
    if (votacion.estado !== EstadoVotacion.ACTIVA) {
      throw new ForbiddenException('La votación no está activa');
    }

    const clean = String(rut).replace(/\.|-|\s/g, '');
    const secret = process.env.VOTANTE_HASH_SECRET ?? '';
    let votanteHash: string;
    if (secret) {
      votanteHash = require('crypto').createHmac('sha256', secret).update(clean).digest('hex');
    } else {
      votanteHash = require('crypto').createHash('sha256').update(clean).digest('hex');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ensure not already voted (unique index will also protect)
      const existing = await queryRunner.manager.findOne(ParticipacionEntity, { where: { votacionId, votanteHash } });
      if (existing) throw new BadRequestException('Ya ejerciste tu voto');

      // insert anonymous voto
      await queryRunner.manager.insert(VotoEntity, { votacionId, payload });

      // record participation (store only votanteHash)
      await queryRunner.manager.insert(ParticipacionEntity, { votacionId, votanteHash });

      await queryRunner.commitTransaction();
      this.auditService.logVoto(rut, ip, votacion.region ?? votacion.comuna ?? 'Sin zona', votacionId).catch(() => {});
      return { ok: true };
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      if (err?.code === '23505' || err?.message?.includes('Ya ejerciste')) {
        throw new BadRequestException('Ya ejerciste tu voto');
      }
      console.error('Error al registrar voto: ', err);
      throw new InternalServerErrorException('Error al procesar el voto');
    } finally {
      await queryRunner.release();
    }
  }
}
