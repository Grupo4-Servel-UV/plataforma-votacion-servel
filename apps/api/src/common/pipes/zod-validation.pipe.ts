import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodType, ZodError } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        // Return structured validation errors in the response body (helpful for development)
        throw new BadRequestException({ message: 'Fallo de validación de contrato', issues: error.issues });
      }
      throw new BadRequestException('Fallo de validación de contrato');
    }
  }
}
