import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UsePipes, Query } from '@nestjs/common';
import {
  AsignarCandidatosInput,
  AsignarCandidatosSchema,
  CreateVotacionInput,
  CreateVotacionSchema,
  UpdateVotacionInput,
  UpdateVotacionSchema,
} from '@servel/contracts';
import { TipoAdminLog } from '@servel/database';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { AuditService } from '../audit/audit.service';
import { VotacionesService } from './votaciones.service';

function extractIp(req: any): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
    req.ip ??
    'unknown'
  );
}

@Controller({ path: 'votaciones', version: '1' })
export class VotacionesController {
  constructor(
    private readonly votacionesService: VotacionesService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateVotacionSchema))
  async create(@Body() input: CreateVotacionInput, @Req() req: any) {
    const res = await this.votacionesService.create(input);
    this.auditService.logAdminAccion(TipoAdminLog.ACCION_VOTACION, 'CREAR', `Votación creada: ${input.nombre}`, extractIp(req), res.id).catch(() => {});
    return res;
  }

  @Post(':votacionId/candidatos')
  async asignarCandidatos(
    @Param('votacionId', new ParseUUIDPipe()) votacionId: string,
    @Body(new ZodValidationPipe(AsignarCandidatosSchema)) body: AsignarCandidatosInput,
    @Req() req: any,
  ) {
    const res = await this.votacionesService.asignarCandidatos(votacionId, body.candidatosIds);
    this.auditService.logAdminAccion(TipoAdminLog.ACCION_VOTACION, 'ASIGNAR_CANDIDATOS', `Candidatos asignados a votación ${votacionId}`, extractIp(req), votacionId, { cantidad: body.candidatosIds.length }).catch(() => {});
    return res;
  }

  @Get()
  async findAll() {
    return this.votacionesService.findAll();
  }

  @Get(':id/resultados')
  async getResultados(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.votacionesService.getResultados(id);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.votacionesService.findOne(id);
  }

  @Get(':id/eligibility')
  async checkEligibility(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('rut') rut: string,
  ) {
    return this.votacionesService.checkEligibility(id, rut);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(UpdateVotacionSchema)) body: UpdateVotacionInput,
    @Req() req: any,
  ) {
    const res = await this.votacionesService.updateVotacion(id, body);
    this.auditService.logAdminAccion(TipoAdminLog.ACCION_VOTACION, 'EDITAR', `Votación ${id} editada`, extractIp(req), id, body as any).catch(() => {});
    return res;
  }

  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: any) {
    const res = await this.votacionesService.deleteVotacion(id);
    this.auditService.logAdminAccion(TipoAdminLog.ACCION_VOTACION, 'ELIMINAR', `Votación ${id} eliminada`, extractIp(req), id).catch(() => {});
    return res;
  }

  @Post(':id/votar')
  async votar(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.votacionesService.castVote(id, body.rut, body.payload, extractIp(req));
  }
}
