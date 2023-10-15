import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerDefinition } from './swagger.config';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const { config, option } = SwaggerDefinition();
  const document = SwaggerModule.createDocument(app, config.build());
  SwaggerModule.setup('docs', app, document, option);

  await app.listen(3000);
}
bootstrap();
