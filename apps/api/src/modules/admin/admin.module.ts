import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
})
export class AdminModule {}
