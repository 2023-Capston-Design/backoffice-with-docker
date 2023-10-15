import { Test, TestingModule } from '@nestjs/testing';
import { BackofficeController } from './backoffice.controller';

describe('BackofficeController', () => {
  let controller: BackofficeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BackofficeController],
    }).compile();

    controller = module.get<BackofficeController>(BackofficeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
