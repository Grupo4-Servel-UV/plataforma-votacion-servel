import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { EmailService } from 'src/common/services/email.service';
import { AuthController } from './auth.controller';
import { VotanteEntity, VotanteOtpEntity } from '@servel/database';
import { VotacionesModule } from '../votaciones/votaciones.module';

@Module({
  imports: [TypeOrmModule.forFeature([VotanteEntity, VotanteOtpEntity]), VotacionesModule],
  controllers: [AuthController],
  providers: [AuthService, OtpService, EmailService],
  exports: [AuthService, OtpService],
})
export class AuthModule {}
