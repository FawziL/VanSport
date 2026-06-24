import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { R2Service } from '../storage/r2.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, R2Service],
})
export class CategoriesModule {}
