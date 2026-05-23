import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VotanteEntity, VotanteResetTokenEntity } from '@servel/database';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { parse } from 'csv-parse/sync';
import * as path from 'path';
import { EmailService } from 'src/common/services/email.service';
import { Repository } from 'typeorm';
import { LoginInput } from './login.schema';
import { RegisterInput } from './register.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(VotanteEntity)
    private votanteRepo: Repository<VotanteEntity>,
    @InjectRepository(VotanteResetTokenEntity)
    private resetRepo: Repository<VotanteResetTokenEntity>,
    private emailService: EmailService,
  ) {}

  async register(input: RegisterInput) {
    const normalized = this.normalizeRut(input.rut);
    const existing = await this.votanteRepo.findOneBy({ rut: normalized });
    if (existing) throw new BadRequestException('RUT ya registrado');
    // Check email uniqueness when provided
    const email = (input as any).email ?? null;
    if (email) {
      const existsEmail = await this.votanteRepo.findOneBy({ email });
      if (existsEmail) throw new BadRequestException('Email ya registrado');
    }

    const hash = await bcrypt.hash(input.clave, 10);

    const votante = this.votanteRepo.create({
      nombres: input.nombres,
      apellidos: input.apellidos,
      rut: normalized,
      email: (input as any).email ?? null,
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

  // Validate an uploaded padrón file (CSV or JSON). Does not modify the DB.
  async validatePadronFile(file: Express.Multer.File) {
    const filename = file?.originalname ?? 'file';
    const ext = path.extname(filename || '').toLowerCase();
    let records: any[] = [];

    // parse JSON
    if (ext === '.json' || file.mimetype === 'application/json') {
      try {
        const parsed = JSON.parse(file.buffer.toString('utf8'));
        if (!Array.isArray(parsed)) throw new BadRequestException('JSON debe ser un arreglo de objetos');
        records = parsed;
      } catch (err: any) {
        throw new BadRequestException('Error parseando JSON: ' + (err?.message ?? String(err)));
      }
    } else {
      // parse CSV
      try {
        const txt = file.buffer.toString('utf8');
        records = parse(txt, { columns: true, skip_empty_lines: true, trim: true });
      } catch (err: any) {
        throw new BadRequestException('Error parseando CSV: ' + (err?.message ?? String(err)));
      }
    }

    const errors: Array<{ row: number; field?: string; message: string; details?: any }> = [];
    const seen = new Map<string, number>();
    const requiredFields = ['rut', 'region', 'comuna', 'estado_habilitacion', 'email'];

    for (let i = 0; i < records.length; i++) {
      const row = records[i] ?? {};
      const rowNum = i + 1;

      // Check required fields (supporting email header as `email` or `correo`)
      for (const f of requiredFields) {
        if (f === 'email') {
          const val = row['email'] ?? row['correo'] ?? row['mail'] ?? row['correo_electronico'];
          if (val === undefined || val === null || String(val).trim() === '') {
            errors.push({ row: rowNum, field: 'email', message: 'Campo obligatorio faltante' });
          }
        } else {
          if (row[f] === undefined || row[f] === null || String(row[f]).trim() === '') {
            errors.push({ row: rowNum, field: f, message: 'Campo obligatorio faltante' });
          }
        }
      }

      // Validate RUT format
      const rawRut = row['rut'];
      if (rawRut) {
        const clean = String(rawRut).replace(/[\.\-\s]/g, '');
        const m = clean.match(/^(\d{7,8})([0-9Kk])$/);
        if (!m) {
          errors.push({ row: rowNum, field: 'rut', message: 'RUT inválido' });
        }

        const normalized = this.normalizeRut(String(rawRut));
        if (seen.has(normalized)) {
          errors.push({ row: rowNum, field: 'rut', message: 'Duplicado en archivo (mismo RUT aparece varias veces)', details: { firstRow: seen.get(normalized) } });
        } else {
          seen.set(normalized, rowNum);
        }
      }

      // Validate estado_habilitacion
      const estadoRaw = row['estado_habilitacion'];
      const estadoStr = estadoRaw === undefined || estadoRaw === null ? '' : String(estadoRaw).trim().toLowerCase();
      if (estadoStr === '') {
        // already reported as missing above
      } else if (!['habilitado', 'inhabilitado', 'true', 'false', '1', '0'].includes(estadoStr)) {
        errors.push({ row: rowNum, field: 'estado_habilitacion', message: 'Valor inválido. Use "habilitado" o "inhabilitado"' });
      }

      // Validate email format and length (accept headers `email` or `correo`)
      const rawEmail = row['email'] ?? row['correo'] ?? row['mail'] ?? row['correo_electronico'];
      if (rawEmail) {
        const emailStr = String(rawEmail).trim();
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr) && emailStr.length <= 255;
        if (!emailOk) {
          errors.push({ row: rowNum, field: 'email', message: 'Email inválido o demasiado largo (máx 255 chars)' });
        }
      }

      // region/comuna already checked for emptiness above
    }

    // detect duplicate emails within the file
    const emailSeen = new Map<string, number>();
    for (let i = 0; i < records.length; i++) {
      const row = records[i] ?? {};
      const rowNum = i + 1;
      const rawEmail = row['email'] ?? row['correo'] ?? row['mail'] ?? row['correo_electronico'];
      if (rawEmail) {
        const emailNorm = String(rawEmail).trim().toLowerCase();
        if (emailSeen.has(emailNorm)) {
          errors.push({ row: rowNum, field: 'email', message: 'Email duplicado en archivo', details: { firstRow: emailSeen.get(emailNorm) } });
        } else {
          emailSeen.set(emailNorm, rowNum);
        }
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException({ errors });
    }

    return { ok: true, total: records.length, records };
  }

  // Import and upsert padrón records into DB. Atomic transaction: either all rows applied or none.
  async importPadronFile(file: Express.Multer.File) {
    const parsed = await this.validatePadronFile(file) as any;
    const records: any[] = parsed.records ?? [];

    let added = 0;
    let updated = 0;

    try {
      await this.votanteRepo.manager.transaction(async (em) => {
        for (let i = 0; i < records.length; i++) {
          const row = records[i] ?? {};
          const rowNum = i + 1;

          const rawRut = row['rut'];
          const normalizedRut = this.normalizeRut(String(rawRut));

          const rawEmail = row['email'] ?? row['correo'] ?? row['mail'] ?? row['correo_electronico'];
          const email = rawEmail ? String(rawEmail).trim().toLowerCase() : null;

          const nombres = row['nombres'] ?? row['nombre'] ?? null;
          const apellidos = row['apellidos'] ?? row['apellido'] ?? null;
          const fechaNacimiento = row['fecha_nacimiento'] ?? row['fechaNacimiento'] ?? null;
          const comunidad = row['comunidad_indigena'] ?? row['comunidadIndigena'] ?? row['comunidad'] ?? null;
          const region = row['region'] ?? null;
          const comuna = row['comuna'] ?? null;
          const etnia = row['etnia'] ?? null;

          const estadoRaw = row['estado_habilitacion'];
          const estadoStr = estadoRaw === undefined || estadoRaw === null ? '' : String(estadoRaw).trim().toLowerCase();
          const habilitado = ['habilitado', 'true', '1'].includes(estadoStr);

          // check for email conflict with another existing votante
          if (email) {
            const byEmail = await em.findOne(VotanteEntity, { where: { email } });
            if (byEmail && byEmail.rut !== normalizedRut) {
              throw new BadRequestException({ errors: [{ row: rowNum, field: 'email', message: 'Email ya asociado a otro RUT' }] });
            }
          }

          // find existing by normalized rut
          let existing = await em.findOne(VotanteEntity, { where: { rut: normalizedRut } });

          if (existing) {
            existing.nombres = nombres ?? existing.nombres;
            existing.apellidos = apellidos ?? existing.apellidos;
            existing.email = email ?? existing.email;
            existing.fechaNacimiento = fechaNacimiento ?? existing.fechaNacimiento;
            existing.comunidadIndigena = comunidad ?? existing.comunidadIndigena;
            existing.region = region ?? existing.region;
            existing.comuna = comuna ?? existing.comuna;
            existing.etnia = etnia ?? existing.etnia;
            existing.habilitado = habilitado;

            await em.save(existing);
            updated++;
          } else {
            const randomSecret = crypto.randomBytes(16).toString('hex');
            const hash = await bcrypt.hash(randomSecret, 10);

            const toCreate = em.create(VotanteEntity, {
              nombres: nombres ?? '',
              apellidos: apellidos ?? '',
              rut: normalizedRut,
              email: email ?? null,
              fechaNacimiento: fechaNacimiento ?? null,
              comunidadIndigena: comunidad ?? null,
              region: region ?? null,
              comuna: comuna ?? null,
              etnia: etnia ?? null,
              claveHash: hash,
              habilitado,
            });

            await em.save(toCreate);
            added++;
          }
        }
      });
    } catch (err: any) {
      // rethrow known BadRequestException from validation/conflicts
      if (err instanceof BadRequestException) throw err;
      // wrap other errors
      throw new BadRequestException('Error al importar padrón: ' + (err?.message ?? String(err)));
    }

    return { ok: true, total: records.length, added, updated };
  }

  // Request a password reset: creates token, emails link
  async requestPasswordReset(rut: string) {
    const normalized = this.normalizeRut(rut);
    const votante = await this.votanteRepo.findOneBy({ rut: normalized });
    if (!votante) throw new BadRequestException('Votante no encontrado');
    if (!votante.email) throw new BadRequestException('Votante no tiene email registrado');

    const token = crypto.randomBytes(24).toString('hex');
    const tokenHash = await bcrypt.hash(token, 10);
    const ttl = Number(process.env.PASSWORD_RESET_TTL_MINUTES ?? 60);
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000);

    let existing: VotanteResetTokenEntity | null = await this.resetRepo.findOneBy({ votanteId: votante.id });
    if (!existing) {
      existing = this.resetRepo.create({ votanteId: votante.id, tokenHash, expiresAt });
    } else {
      existing.tokenHash = tokenHash;
      existing.expiresAt = expiresAt;
    }
    await this.resetRepo.save(existing);

    const frontend = process.env.FRONTEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    const link = `${frontend}/auth/reset?rut=${encodeURIComponent(normalized)}&token=${encodeURIComponent(token)}`;

    await this.emailService.sendPasswordReset(votante.email, link);
    return { ok: true };
  }

  async resetPassword(rut: string, token: string, newPassword: string) {
    const normalized = this.normalizeRut(rut);
    const votante = await this.votanteRepo.findOneBy({ rut: normalized });
    if (!votante) throw new BadRequestException('Votante no encontrado');

    const tokenRow = await this.resetRepo.findOneBy({ votanteId: votante.id });
    if (!tokenRow) throw new BadRequestException('Token inválido o no solicitado');
    if (tokenRow.expiresAt.getTime() < Date.now()) throw new BadRequestException('Token expirado');

    const match = await bcrypt.compare(token, tokenRow.tokenHash);
    if (!match) throw new BadRequestException('Token inválido');

    const hash = await bcrypt.hash(newPassword, 10);
    votante.claveHash = hash;
    await this.votanteRepo.save(votante);
    await this.resetRepo.remove(tokenRow);
    return { ok: true };
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
