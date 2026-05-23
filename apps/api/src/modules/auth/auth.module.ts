import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VotanteEntity, VotanteOtpEntity, VotanteResetTokenEntity } from '@servel/database';
import { EmailService } from 'src/common/services/email.service';
import { VotacionesModule } from '../votaciones/votaciones.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';

@Module({
  imports: [TypeOrmModule.forFeature([VotanteEntity, VotanteOtpEntity, VotanteResetTokenEntity]), VotacionesModule],
  controllers: [AuthController],
  providers: [AuthService, OtpService, EmailService],
  exports: [AuthService, OtpService],
})
export class AuthModule {}
