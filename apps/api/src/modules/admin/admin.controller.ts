import { Controller, Param, Put, Get, Delete, Body } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(private authService: AuthService) {}

  @Put('enable/:rut')
  async enable(@Param('rut') rut: string) {
    const res = await this.authService.enableVotante(rut);
    return { body: res };
  }

  @Get('votantes')
  async list() {
    const res = await this.authService.listVotantes();
    return { body: res };
  }

  @Put('votantes/:rut')
  async set(@Param('rut') rut: string, @Body() body: { habilitado: boolean }) {
    const res = await this.authService.setHabilitado(rut, Boolean(body?.habilitado));
    return { body: res };
  }

  @Put('votantes/:rut/etnia')
  async setEtnia(@Param('rut') rut: string, @Body() body: { etnia: string | null }) {
    const res = await this.authService.setEtnia(rut, body?.etnia ?? null);
    return { body: res };
  }

  @Delete('votantes/:rut')
  async remove(@Param('rut') rut: string) {
    const res = await this.authService.deleteVotante(rut);
    return { body: res };
  }
}
