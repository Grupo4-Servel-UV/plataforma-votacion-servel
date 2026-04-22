import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CandidatoEntity } from '@servel/database';
import { CandidatosService } from './candidatos.service';

@Controller({ path: 'candidatos', version: '1' })
export class CandidatosController {
  constructor(private readonly candidatosService: CandidatosService) {}

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
}
