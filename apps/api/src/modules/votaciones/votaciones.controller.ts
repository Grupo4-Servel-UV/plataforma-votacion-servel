import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, UsePipes, Query } from '@nestjs/common';
import {
  AsignarCandidatosInput,
  AsignarCandidatosSchema,
  CreateVotacionInput,
  CreateVotacionSchema,
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

  @Post(':id/votar')
  async votar(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.votacionesService.castVote(id, body.rut, body.payload, extractIp(req));
  }
}
