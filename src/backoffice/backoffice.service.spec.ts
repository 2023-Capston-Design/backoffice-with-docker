import { Test, TestingModule } from '@nestjs/testing';
import { BackofficeService } from './backoffice.service';

describe('BackofficeService', () => {
  let service: BackofficeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BackofficeService],
    }).compile();

    service = module.get<BackofficeService>(BackofficeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
