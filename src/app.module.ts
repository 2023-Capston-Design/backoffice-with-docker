import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BackofficeModule } from './backoffice/backoffice.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [BackofficeModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
