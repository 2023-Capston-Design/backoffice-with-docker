import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BackofficeModule } from './backoffice/backoffice.module';

@Module({
  imports: [BackofficeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
