import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEnvironmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  instructorId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  classId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  studentCount: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  memoryLimit?: number;
}
