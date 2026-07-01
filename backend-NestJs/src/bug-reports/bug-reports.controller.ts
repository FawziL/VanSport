import {
  Controller, Get, Post, Body, Param, Put, Patch, Delete,
  ParseIntPipe, UseGuards, UseInterceptors, UploadedFile, UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imagen', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  async create(
    @UploadedFiles() files: { imagen?: Express.Multer.File[]; video?: Express.Multer.File[] },
    @Body() dto: CreateBugReportDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.bugReportsService.create(dto, userId, files);
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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imagen', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: { imagen?: Express.Multer.File[]; video?: Express.Multer.File[] },
    @Body() dto: UpdateBugReportDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.bugReportsService.update(id, dto, userId, files);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a bug report' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imagen', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  async partialUpdate(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: { imagen?: Express.Multer.File[]; video?: Express.Multer.File[] },
    @Body() dto: UpdateBugReportDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.bugReportsService.update(id, dto, userId, files);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bug report' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: string) {
    return this.bugReportsService.remove(id, userId);
  }

  @Post(':id/followups')
  @ApiOperation({ summary: 'Add followup to bug report' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('imagen'))
  async addFollowup(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: AddFollowupDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.bugReportsService.addFollowup(id, dto, 'user', file);
  }
}
