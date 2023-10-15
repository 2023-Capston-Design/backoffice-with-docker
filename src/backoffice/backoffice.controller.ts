import { Body, Controller, Post } from '@nestjs/common';
import { BackofficeService } from './backoffice.service';
import { CreateEnvironmentDto } from './dto/create-environment';
import { ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { InitEnvrionmentResponse } from './response/init-environment.response';

@Controller('backoffice')
@ApiTags('Backoffice')
export class BackofficeController {
  constructor(private readonly backofficeSerice: BackofficeService) {}

  @Post('/init')
  @ApiProperty({
    description: '환경을 초기화합니다.',
  })
  @ApiOkResponse({
    type: InitEnvrionmentResponse,
  })
  public async createEnvironments(@Body() dto: CreateEnvironmentDto) {
    return this.backofficeSerice.createEnvironments(dto);
  }
}
