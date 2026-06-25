import { Controller, Get } from '@nestjs/common';
import { LogsService } from './logs.service';

@Controller({ path: 'logs', version: '1' })
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get('votantes')
  getVotanteLogs() {
    return this.logsService.getVotanteLogs();
  }

  @Get('admins')
  getAdminLogs() {
    return this.logsService.getAdminLogs();
  }

  @Get('sistema')
  getSistemaLogs() {
    return this.logsService.getSistemaLogs();
  }

  // TEMPORAL: endpoint para forzar un error de prueba en sistema_logs
  @Get('test-error')
  testError() {
    throw new Error('Error de prueba: verificación del sistema de auditoría');
  }
}
