import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { R2Service } from '../storage/r2.service';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, R2Service],
})
export class TransactionsModule {}
