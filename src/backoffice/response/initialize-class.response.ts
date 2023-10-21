import { ApiProperty } from '@nestjs/swagger';

export class InitializeClassResponse {
  @ApiProperty()
  host: string;

  @ApiProperty()
  containerId: string;
}
