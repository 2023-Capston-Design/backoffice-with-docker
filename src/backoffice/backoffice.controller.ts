import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { BackofficeService } from './backoffice.service';
import { CreateStudentEnvironmentDto } from './dto/create-student-environment';
import { InitializeClassDto } from './dto/initialize-class.dto';
import { InitializeClassResponse } from './response/initialize-class.response';

@Controller('backoffice')
@ApiTags('Backoffice')
export class BackofficeController {
  constructor(private readonly backofficeSerice: BackofficeService) {}

  @Post('/init')
  @ApiProperty({
    description: '수업 환경을 초기화 합니다. Instructor가 수업 생성 후 실행됨.',
  })
  @ApiOkResponse({
    type: InitializeClassResponse,
  })
  public async createEnvironments(@Body() dto: InitializeClassDto) {
    return this.backofficeSerice.initializeClass(dto);
  }

  @Post('/init/student')
  @ApiProperty({
    description: '수업 환경을 초기화 합니다. Instructor가 수업 생성 후 실행됨.',
  })
  @ApiOkResponse({
    type: InitializeClassResponse,
  })
  public async createStudentEnvironments(
    @Body() dto: CreateStudentEnvironmentDto,
  ) {
    return this.backofficeSerice.createStudentEnvironment(dto);
  }
}
