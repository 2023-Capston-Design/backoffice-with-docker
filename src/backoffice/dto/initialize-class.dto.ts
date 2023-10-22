import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class InitializeClassDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  classId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  instructorId: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  memory: number;
}
