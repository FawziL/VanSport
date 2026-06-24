import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { R2Service } from '../storage/r2.service';

@Module({
  imports: [
    MulterModule.register({ storage: memoryStorage() }),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService, R2Service],
})
export class CategoriesModule {}
