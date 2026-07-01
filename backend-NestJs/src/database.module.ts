import { Global, Module } from '@nestjs/common';
import { db } from '../db';

@Global()
@Module({
  providers: [
    {
      provide: 'DRIZZLE',
      useValue: db,
    },
  ],
  exports: ['DRIZZLE'],
})
export class DatabaseModule {}
