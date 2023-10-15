import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

export const SwaggerDefinition = () => {
  const config: DocumentBuilder = new DocumentBuilder()
    .setTitle('Backoffice')
    .setDescription('Backoffice')
    .setVersion('1.0');

  const option: SwaggerCustomOptions = {
    explorer: true,
  };

  return {
    config,
    option,
  };
};
