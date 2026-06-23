import { Controller, Get, Post, Body, Param, Put, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BugReportsService } from './bug-reports.service';
import { CreateBugReportDto } from './dto/create-bug-report.dto';
import { UpdateBugReportDto } from './dto/update-bug-report.dto';
import { AddFollowupDto } from './dto/add-followup.dto';
import { AuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';

@ApiTags('Bug Reports')
@Controller('bug-reports')
@UseGuards(AuthGuard)
export class BugReportsController {
  constructor(private readonly bugReportsService: BugReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user bug reports' })
  findByUser(@CurrentUser('id') userId: string) {
    return this.bugReportsService.findByUser(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a bug report' })
  create(@Body() dto: CreateBugReportDto, @CurrentUser('id') userId: string) {
    return this.bugReportsService.create(dto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bug report by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bugReportsService.findOne(id);
  }

  @Get(':id/followups')
  @ApiOperation({ summary: 'Get bug report followups' })
  findFollowups(@Param('id', ParseIntPipe) id: number) {
    return this.bugReportsService.findFollowups(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a bug report' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBugReportDto, @CurrentUser('id') userId: string) {
    return this.bugReportsService.update(id, dto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a bug report' })
  partialUpdate(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBugReportDto, @CurrentUser('id') userId: string) {
    return this.bugReportsService.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bug report' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: string) {
    return this.bugReportsService.remove(id, userId);
  }

  @Post(':id/followups')
  @ApiOperation({ summary: 'Add followup to bug report' })
  addFollowup(@Param('id', ParseIntPipe) id: number, @Body() dto: AddFollowupDto, @CurrentUser('id') userId: string) {
    return this.bugReportsService.addFollowup(id, dto, 'user');
  }
}
