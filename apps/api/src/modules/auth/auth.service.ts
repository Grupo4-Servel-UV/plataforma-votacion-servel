import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VotanteEntity } from '@servel/database';
import { RegisterInput } from './register.schema';
import { LoginInput } from './login.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(VotanteEntity)
    private votanteRepo: Repository<VotanteEntity>,
  ) {}

  async register(input: RegisterInput) {
    const normalized = this.normalizeRut(input.rut);
    const existing = await this.votanteRepo.findOneBy({ rut: normalized });
    if (existing) throw new BadRequestException('RUT ya registrado');

    const hash = await bcrypt.hash(input.clave, 10);

    const votante = this.votanteRepo.create({
      nombres: input.nombres,
      apellidos: input.apellidos,
      rut: normalized,
      fechaNacimiento: input.fechaNacimiento ?? null,
      comunidadIndigena: input.comunidadIndigena ?? null,
      region: input.region ?? null,
      comuna: input.comuna ?? null,
      etnia: (input as any).etnia ?? null,
      claveHash: hash,
      habilitado: false,
    });

    await this.votanteRepo.save(votante);

    const { claveHash, ...rest } = votante as any;
    return rest as Partial<VotanteEntity>;
  }

  async validateCredentials(input: LoginInput) {
    const normalized = this.normalizeRut(input.rut);
    const votante = await this.votanteRepo.findOneBy({ rut: normalized });
    if (!votante) throw new UnauthorizedException('RUT o clave inválidos');

    const match = await bcrypt.compare(input.clave, votante.claveHash);
    if (!match) throw new UnauthorizedException('RUT o clave inválidos');

    const { claveHash, ...rest } = votante as any;
    return { votante: rest as Partial<VotanteEntity>, habilitado: votante.habilitado };
  }

  async findByRut(rut: string) {
    return this.votanteRepo.findOneBy({ rut: this.normalizeRut(rut) });
  }

  async enableVotante(rut: string) {
    const votante = await this.votanteRepo.findOneBy({ rut: this.normalizeRut(rut) });
    if (!votante) throw new BadRequestException('Votante no encontrado');
    votante.habilitado = true;
    await this.votanteRepo.save(votante);
    const { claveHash, ...rest } = votante as any;
    return rest as Partial<VotanteEntity>;
  }

  async listVotantes() {
    const lista = await this.votanteRepo.find();
    return lista.map((v) => {
      const { claveHash, ...rest } = v as any;
      return rest as Partial<VotanteEntity>;
    });
  }

  async deleteVotante(rut: string) {
    const normalized = this.normalizeRut(rut);
    // Try multiple lookup strategies to support pre-existing unformatted RUTs
    let votante = await this.votanteRepo.findOneBy({ rut: normalized });
    if (!votante) votante = await this.votanteRepo.findOneBy({ rut });
    if (!votante) {
      const clean = String(rut).replace(/[\.\-\s]/g, '');
      // search by removing dots/hyphens from stored rut
      votante = await this.votanteRepo
        .createQueryBuilder('v')
        .where("replace(replace(v.rut, '.', ''), '-', '') = :clean", { clean })
        .getOne();
    }

    if (!votante) throw new BadRequestException('Votante no encontrado');
    await this.votanteRepo.remove(votante);
    return { ok: true };
  }

  async setHabilitado(rut: string, habilitado: boolean) {
    const votante = await this.votanteRepo.findOneBy({ rut: this.normalizeRut(rut) });
    if (!votante) throw new BadRequestException('Votante no encontrado');
    votante.habilitado = habilitado;
    await this.votanteRepo.save(votante);
    const { claveHash, ...rest } = votante as any;
    return rest as Partial<VotanteEntity>;
  }

  async setEtnia(rut: string, etnia: string | null) {
    const votante = await this.votanteRepo.findOneBy({ rut: this.normalizeRut(rut) });
    if (!votante) throw new BadRequestException('Votante no encontrado');
    votante.etnia = etnia ?? null;
    await this.votanteRepo.save(votante);
    const { claveHash, ...rest } = votante as any;
    return rest as Partial<VotanteEntity>;
  }

  // Normalize RUT to format XX.XXX.XXX-X or X.XXX.XXX-X when possible.
  private normalizeRut(raw: string): string {
    if (!raw) return raw;
    const s = String(raw).trim();
    // remove dots and spaces
    const cleaned = s.replace(/[\.\s]/g, '');
    // split by hyphen
    let base = cleaned;
    let dv = '';
    if (cleaned.includes('-')) {
      const parts = cleaned.split('-');
      base = parts[0] ?? '';
      dv = parts[1] ?? '';
    } else if (cleaned.length > 1) {
      dv = cleaned.slice(-1);
      base = cleaned.slice(0, -1);
    }

    // ensure base only digits
    const digits = base.replace(/\D/g, '');
    let formattedBase = digits;
    if (digits.length === 8) {
      formattedBase = `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}`;
    } else if (digits.length === 7) {
      formattedBase = `${digits.slice(0, 1)}.${digits.slice(1, 4)}.${digits.slice(4, 7)}`;
    } else {
      // fallback: insert dots every 3 chars from the right
      formattedBase = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    return dv ? `${formattedBase}-${dv.toUpperCase()}` : formattedBase;
  }
}
