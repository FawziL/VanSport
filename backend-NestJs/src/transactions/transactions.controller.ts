import { Controller, Get, Post, Body, Param, Put, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PayTransactionDto } from './dto/pay-transaction.dto';
import { AuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';

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
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  @Post('pay')
  @ApiOperation({ summary: 'Pay a transaction' })
  pay(@Body() dto: PayTransactionDto) {
    return this.transactionsService.pay(0, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.update(id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a transaction' })
  partialUpdate(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.remove(id);
  }
}
