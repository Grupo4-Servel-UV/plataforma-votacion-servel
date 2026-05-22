import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: Partial<CandidatoEntity>) {
    const created = await this.candidatosService.create(body);
    return created;
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() body: Partial<CandidatoEntity>) {
    const updated = await this.candidatosService.update(id, body);
    return updated;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.candidatosService.remove(id);
    return { ok: true };
  }
}
