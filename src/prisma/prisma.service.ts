import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  async deletAll() {
    try {
      return this.$transaction([
        this.class.deleteMany(),
        this.environment.deleteMany(),
      ]);
    } finally {
      return true;
    }
  }
}
