import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Req } from '@nestjs/common';
import { CandidatoEntity, TipoAdminLog } from '@servel/database';
import { AuditService } from '../audit/audit.service';
import { CandidatosService } from './candidatos.service';

function extractIp(req: any): string {
  return (
    req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ??
    req.socket?.remoteAddress ??
    req.ip ??
    'unknown'
  );
}

@Controller({ path: 'candidatos', version: '1' })
export class CandidatosController {
  constructor(
    private readonly candidatosService: CandidatosService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<CandidatoEntity[]> {
    return await this.candidatosService.findAll();
  }

  @Get('disponibles')
  @HttpCode(HttpStatus.OK)
  async findDisponibles(): Promise<CandidatoEntity[]> {
    return await this.candidatosService.findDisponibles();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: Partial<CandidatoEntity>, @Req() req: any) {
    const created = await this.candidatosService.create(body);
    this.auditService
      .logAdminAccion(
        TipoAdminLog.ACCION_CANDIDATO,
        'CREAR',
        `Candidato creado: ${created.nombres} ${created.apellidos}`,
        extractIp(req),
        created.votacionId ?? undefined,
        { candidatoId: created.id },
      )
      .catch(() => {});
    return created;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() body: Partial<CandidatoEntity>, @Req() req: any) {
    const updated = await this.candidatosService.update(id, body);
    const tieneVotacion = updated.votacionId != null;
    this.auditService
      .logAdminAccion(
        TipoAdminLog.ACCION_CANDIDATO,
        tieneVotacion ? 'ASIGNAR' : 'ACTUALIZAR',
        `Candidato ${tieneVotacion ? 'asignado a votación' : 'actualizado'}: ${updated.nombres} ${updated.apellidos}`,
        extractIp(req),
        updated.votacionId ?? undefined,
        { candidatoId: updated.id },
      )
      .catch(() => {});
    return updated;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.candidatosService.remove(id);
    this.auditService
      .logAdminAccion(
        TipoAdminLog.ACCION_CANDIDATO,
        'ELIMINAR',
        `Candidato eliminado: id=${id}`,
        extractIp(req),
        undefined,
        { candidatoId: id },
      )
      .catch(() => {});
    return { ok: true };
  }
}
