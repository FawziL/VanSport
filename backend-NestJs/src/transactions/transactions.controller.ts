import {
  Controller, Get, Post, Body, Param, Put, Patch, Delete,
  ParseIntPipe, UseGuards, UseInterceptors, UploadedFile, Res, Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PayTransactionDto } from './dto/pay-transaction.dto';
import { AuthGuard, RolesGuard } from '../common/guards';
import { Roles, CurrentUser } from '../common/decorators';
import { Response } from 'express';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user transactions' })
  findByUser(@CurrentUser('id') userId: string) {
    return this.transactionsService.findByUser(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a transaction' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('comprobante'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(dto, file);
  }

  @Post('pay')
  @ApiOperation({ summary: 'Pay a transaction' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('comprobante'))
  async pay(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: PayTransactionDto,
  ) {
    return this.transactionsService.pay(0, dto, file);
  }

  @Get('export')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Export transactions to Excel (admin)' })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  async export(
    @Res() res: Response,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    const buffer = await this.transactionsService.exportExcel(startDate, endDate);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="transacciones.xlsx"`);
    res.send(buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('comprobante'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.update(id, dto, file);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a transaction' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('comprobante'))
  async partialUpdate(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.update(id, dto, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.remove(id);
  }
}
