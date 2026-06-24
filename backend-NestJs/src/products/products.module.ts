import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { R2Service } from '../storage/r2.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, R2Service],
})
export class ProductsModule {}
