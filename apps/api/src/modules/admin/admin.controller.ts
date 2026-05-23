import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { TipoAdminLog } from '@servel/database';
import { AuditService } from '../audit/audit.service';
import { AuthService } from '../auth/auth.service';

function extractIp(req: any): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
    req.ip ??
    'unknown'
  );
}

@Controller({ path: 'admin', version: '1' })
export class AdminController {
  constructor(
    private authService: AuthService,
    private auditService: AuditService,
  ) {}

  @Put('enable/:rut')
  async enable(@Param('rut') rut: string, @Req() req: any) {
    const res = await this.authService.enableVotante(rut);
    this.auditService.logAdminAccion(TipoAdminLog.ACCION_VOTANTE, 'HABILITAR', `Votante ${rut} habilitado`, extractIp(req)).catch(() => {});
    return { body: res };
  }

  @Get('votantes')
  async list() {
    const res = await this.authService.listVotantes();
    return { body: res };
  }

  @Put('votantes/:rut')
  async set(@Param('rut') rut: string, @Body() body: { habilitado: boolean }, @Req() req: any) {
    const res = await this.authService.setHabilitado(rut, Boolean(body?.habilitado));
    const accion = body?.habilitado ? 'HABILITAR' : 'DESHABILITAR';
    this.auditService.logAdminAccion(TipoAdminLog.ACCION_VOTANTE, accion, `Votante ${rut} ${accion.toLowerCase()}do`, extractIp(req)).catch(() => {});
    return { body: res };
  }

  @Put('votantes/:rut/etnia')
  async setEtnia(@Param('rut') rut: string, @Body() body: { etnia: string | null }, @Req() req: any) {
    const res = await this.authService.setEtnia(rut, body?.etnia ?? null);
    this.auditService.logAdminAccion(TipoAdminLog.ACCION_VOTANTE, 'ACTUALIZAR_ETNIA', `Etnia de votante ${rut} actualizada`, extractIp(req)).catch(() => {});
    return { body: res };
  }

  @Delete('votantes/:rut')
  async remove(@Param('rut') rut: string, @Req() req: any) {
    const res = await this.authService.deleteVotante(rut);
    this.auditService.logAdminAccion(TipoAdminLog.ACCION_VOTANTE, 'ELIMINAR', `Votante ${rut} eliminado`, extractIp(req)).catch(() => {});
    return { body: res };
  }

  @Post('padron/upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }))
  async uploadPadron(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file) throw new BadRequestException('Archivo no recibido');
    const res = await this.authService.importPadronFile(file);
    this.auditService.logAdminAccion(TipoAdminLog.SUBIDA_PADRON, 'IMPORTAR', `Padrón importado: ${file.originalname}`, extractIp(req), undefined, { filename: file.originalname, size: file.size }).catch(() => {});
    return { body: res };
  }
}
