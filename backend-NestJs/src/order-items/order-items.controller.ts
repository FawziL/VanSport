import { Controller, Get, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OrderItemsService } from './order-items.service';
import { AuthGuard } from '../common/guards';

@ApiTags('Order Items')
@Controller('order-items')
@UseGuards(AuthGuard)
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Get()
  @ApiOperation({ summary: 'List order items' })
  @ApiQuery({ name: 'orderId', required: false })
  async findAll(@Query('orderId') orderId?: string) {
    if (orderId) {
      return this.orderItemsService.findByOrder(parseInt(orderId));
    }
    return this.orderItemsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order item by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderItemsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order item' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.orderItemsService.remove(id);
  }
}
