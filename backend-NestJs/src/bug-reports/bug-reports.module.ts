import { Module } from '@nestjs/common';
import { BugReportsController } from './bug-reports.controller';
import { BugReportsService } from './bug-reports.service';
import { R2Service } from '../storage/r2.service';

@Module({
  controllers: [BugReportsController],
  providers: [BugReportsService, R2Service],
})
export class BugReportsModule {}
