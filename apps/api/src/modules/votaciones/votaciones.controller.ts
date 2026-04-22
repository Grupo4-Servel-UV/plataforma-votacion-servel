import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UsePipes } from '@nestjs/common';
import {
  AsignarCandidatosInput,
  AsignarCandidatosSchema,
  CreateVotacionInput,
  CreateVotacionSchema,
} from '@servel/contracts';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { VotacionesService } from './votaciones.service';

@Controller({ path: 'votaciones', version: '1' })
export class VotacionesController {
  constructor(private readonly votacionesService: VotacionesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateVotacionSchema))
  async create(@Body() input: CreateVotacionInput) {
    return this.votacionesService.create(input);
  }

  @Post(':votacionId/candidatos')
  asignarCandidatos(
    @Param('votacionId', new ParseUUIDPipe()) votacionId: string,
    @Body(new ZodValidationPipe(AsignarCandidatosSchema)) body: AsignarCandidatosInput,
  ) {
    return this.votacionesService.asignarCandidatos(votacionId, body.candidatosIds);
  }

  @Get()
  async findAll() {
    return this.votacionesService.findAll();
  }
}
