import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
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

  @Post('padron/upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }))
  async uploadPadron(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Archivo no recibido');
    const res = await this.authService.importPadronFile(file);
    return { body: res };
  }
}
