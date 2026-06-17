import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AdminLogEntity,
  GravedadSistema,
  SistemaLogEntity,
  TipoAdminLog,
  TipoVotanteLog,
  VotanteLogEntity,
} from '@servel/database';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';

@Injectable()
export class AuditService {
  private readonly secret = process.env.VOTANTE_HASH_SECRET ?? '';

  constructor(
    @InjectRepository(VotanteLogEntity)
    private readonly votanteLogRepo: Repository<VotanteLogEntity>,
    @InjectRepository(AdminLogEntity)
    private readonly adminLogRepo: Repository<AdminLogEntity>,
    @InjectRepository(SistemaLogEntity)
    private readonly sistemaLogRepo: Repository<SistemaLogEntity>,
  ) {}

  private hashSensitive(value: string): string {
    const s = String(value ?? '').trim();
    if (!s) return '';
    if (this.secret) return crypto.createHmac('sha256', this.secret).update(s).digest('hex');
    return crypto.createHash('sha256').update(s).digest('hex');
  }

  async logAutenticacion(rut: string, ip: string, resultado: 'EXITOSO' | 'FALLIDO') {
    try {
      await this.votanteLogRepo.insert({
        tipo: TipoVotanteLog.AUTENTICACION,
        rutHash: this.hashSensitive(rut),
        ipHash: this.hashSensitive(ip),
        resultado,
      });
    } catch {}
  }

  async logVoto(rut: string, ip: string, zona: string | null, votacionId: string) {
    try {
      await this.votanteLogRepo.insert({
        tipo: TipoVotanteLog.VOTO,
        rutHash: this.hashSensitive(rut),
        ipHash: this.hashSensitive(ip),
        zona: zona ?? undefined,
        votacionId,
        resultado: 'EMITIDO',
      });
    } catch {}
  }

  async logIntentoFallido(rut: string, ip: string, cantidad: number, bloqueado: boolean) {
    try {
      await this.votanteLogRepo.insert({
        tipo: TipoVotanteLog.INTENTO_FALLIDO,
        rutHash: this.hashSensitive(rut),
        ipHash: this.hashSensitive(ip),
        cantidad,
        bloqueado,
        resultado: bloqueado ? 'BLOQUEADO' : 'FALLIDO',
      });
    } catch {}
  }

  async logCierreSesion(rut: string, motivo: string) {
    try {
      await this.votanteLogRepo.insert({
        tipo: TipoVotanteLog.CIERRE_SESION,
        rutHash: this.hashSensitive(rut),
        motivo,
      });
    } catch {}
  }

  async logAdminAccion(
    tipo: TipoAdminLog,
    accion: string,
    descripcion: string,
    ip: string,
    votacionId?: string,
    detalles?: Record<string, any>,
  ) {
    try {
      await this.adminLogRepo.insert({ tipo, accion, descripcion, ip, votacionId, detalles });
    } catch {}
  }

  async logSistemaError(
    tipo: string,
    modulo: string,
    gravedad: GravedadSistema,
    mensaje: string,
    stack?: string,
  ) {
    try {
      await this.sistemaLogRepo.insert({ tipo, modulo, gravedad, mensaje, stack });
    } catch {}
  }
}
