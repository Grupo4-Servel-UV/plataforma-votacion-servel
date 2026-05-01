import { Body, Controller, Post, UsePipes, ForbiddenException } from '@nestjs/common';
import { VotacionesService } from '../votaciones/votaciones.service';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { SendOtpSchema, SendOtpInput, VerifyOtpSchema, VerifyOtpInput } from './otp.schema';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { RegisterSchema, RegisterInput } from './register.schema';
import { LoginSchema, LoginInput } from './login.schema';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private authService: AuthService,
    private otpService: OtpService,
    private votacionesService: VotacionesService,
  ) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(@Body() body: RegisterInput) {
    const res = await this.authService.register(body);
    return { body: res };
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() body: LoginInput) {
    const res = await this.authService.validateCredentials(body);
    return { body: res };
  }

  @Post('send-otp')
  @UsePipes(new ZodValidationPipe(SendOtpSchema))
  async sendOtp(@Body() body: SendOtpInput) {
    if (body.votacionId) {
      const check = await this.votacionesService.checkEligibility(body.votacionId, body.rut);
      if (!check || !check.eligible) {
        throw new ForbiddenException({ message: 'Votante no elegible para esta votación', reasons: check?.reasons ?? [] });
      }
    }

    const res = await this.otpService.sendOtp(body.rut);
    return { body: res };
  }

  @Post('verify-otp')
  @UsePipes(new ZodValidationPipe(VerifyOtpSchema))
  async verifyOtp(@Body() body: VerifyOtpInput) {
    const res = await this.otpService.verifyOtp(body.rut, body.otp);
    return { body: res };
  }

  @Post('resend-otp')
  @UsePipes(new ZodValidationPipe(SendOtpSchema))
  async resendOtp(@Body() body: SendOtpInput) {
    const res = await this.otpService.resendOtp(body.rut);
    return { body: res };
  }
}
