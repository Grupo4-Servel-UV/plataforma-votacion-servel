import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { GravedadSistema } from '@servel/database';
import { AuditService } from 'src/modules/audit/audit.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly auditService: AuditService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();
    const request = ctx.getRequest<any>();

    let status = 500;
    let body: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      body = typeof res === 'string' ? { statusCode: status, message: res } : res;
    } else {
      body = { statusCode: 500, message: 'Internal server error' };
    }

    if (status >= 500) {
      const pathParts = (request.url ?? '')
        .replace(/^\/api\/v\d+\//, '')
        .split('/')
        .filter(Boolean);
      const modulo = pathParts[0] ?? 'unknown';
      const mensaje =
        typeof body?.message === 'string'
          ? body.message
          : Array.isArray(body?.message)
            ? body.message.join('; ')
            : 'Error interno';
      const stack = exception instanceof Error ? exception.stack : undefined;

      this.auditService
        .logSistemaError(
          exception?.constructor?.name ?? 'UnknownError',
          modulo,
          GravedadSistema.ERROR,
          mensaje,
          stack,
        )
        .catch(() => {});
    }

    response.status(status).json(body);
  }
}
