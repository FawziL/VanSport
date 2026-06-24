import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { R2Service } from '../storage/r2.service';

@Module({
  imports: [
    MulterModule.register({ storage: memoryStorage() }),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, R2Service],
})
export class TransactionsModule {}
