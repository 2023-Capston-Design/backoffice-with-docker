import { ApiProperty } from '@nestjs/swagger';

export class EnvironmentInformation {
  @ApiProperty()
  containerId: string;

  @ApiProperty()
  port: number;
}

export class InitEnvrionmentResponse {
  @ApiProperty({
    type: EnvironmentInformation,
  })
  instructorEnv: EnvironmentInformation;

  @ApiProperty({
    type: EnvironmentInformation,
    isArray: true,
  })
  studentEnv: EnvironmentInformation[];
}
