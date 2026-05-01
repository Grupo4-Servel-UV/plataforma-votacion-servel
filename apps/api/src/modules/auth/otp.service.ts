import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VotanteEntity } from '@servel/database';
import { VotanteOtpEntity } from '@servel/database';
import * as bcrypt from 'bcryptjs';
import { EmailService } from 'src/common/services/email.service';

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(VotanteEntity) private votanteRepo: Repository<VotanteEntity>,
    @InjectRepository(VotanteOtpEntity) private otpRepo: Repository<VotanteOtpEntity>,
    private emailService: EmailService,
  ) {}

  private otpTtlMinutes = Number(process.env.OTP_TTL_MINUTES ?? 5);
  private maxAttempts = Number(process.env.OTP_MAX_ATTEMPTS ?? 3);

  async sendOtp(rut: string) {
    const normalized = this.normalizeRut(rut);
    const votante = await this.votanteRepo.findOneBy({ rut: normalized });
    if (!votante) throw new BadRequestException('Votante no encontrado');
    if (!votante.habilitado) throw new BadRequestException('Votante no habilitado');

    const code = generateOtp();
    const hash = await bcrypt.hash(code, 10);

    let otpRow = await this.otpRepo.findOneBy({ votanteId: votante.id });
    const expiresAt = new Date(Date.now() + this.otpTtlMinutes * 60 * 1000);
    if (!otpRow) {
      otpRow = this.otpRepo.create({ votanteId: votante.id, otpHash: hash, expiresAt, attempts: 0 });
    } else {
      // replace code but keep attempts
      otpRow.otpHash = hash;
      otpRow.expiresAt = expiresAt;
    }
    await this.otpRepo.save(otpRow);

    await this.emailService.sendOtp(votante.email ?? '', code);
    return { ok: true };
  }

  async verifyOtp(rut: string, code: string) {
    const normalized = this.normalizeRut(rut);
    const votante = await this.votanteRepo.findOneBy({ rut: normalized });
    if (!votante) throw new BadRequestException('Votante no encontrado');

    const otpRow = await this.otpRepo.findOneBy({ votanteId: votante.id });
    if (!otpRow) throw new BadRequestException('Código no enviado');

    if (otpRow.expiresAt.getTime() < Date.now()) throw new BadRequestException('Código expirado');

    const match = await bcrypt.compare(code, otpRow.otpHash);
    if (match) {
      await this.otpRepo.remove(otpRow);
      return { ok: true };
    }

    otpRow.attempts = (otpRow.attempts ?? 0) + 1;
    await this.otpRepo.save(otpRow);
    if (otpRow.attempts >= this.maxAttempts) {
      // remove row on lockout
      await this.otpRepo.remove(otpRow);
      return { ok: false, locked: true };
    }
    return { ok: false, attempts: otpRow.attempts };
  }

  async resendOtp(rut: string) {
    // same as send but keep attempts if exists
    return this.sendOtp(rut);
  }

  private normalizeRut(raw: string): string {
    if (!raw) return raw;
    const s = String(raw).trim();
    const cleaned = s.replace(/[\.\s]/g, '');
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
    const digits = base.replace(/\D/g, '');
    let formattedBase = digits;
    if (digits.length === 8) formattedBase = `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}`;
    else if (digits.length === 7) formattedBase = `${digits.slice(0, 1)}.${digits.slice(1, 4)}.${digits.slice(4, 7)}`;
    else formattedBase = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return dv ? `${formattedBase}-${dv.toUpperCase()}` : formattedBase;
  }
}
