import { Controller, Get, Post, Body, Param, Put, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { AuthGuard, RolesGuard } from '../common/guards';
import { CurrentUser, Roles } from '../common/decorators';

@ApiTags('Orders')
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('orders')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user orders' })
  findByUser(@CurrentUser('id') userId: string) {
    return this.ordersService.findByUser(userId);
  }

  @Post('orders')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create an order' })
  create(@Body() dto: CreateOrderDto, @CurrentUser('id') userId: string) {
    return this.ordersService.create(dto, userId);
  }

  @Post('orders/checkout')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Checkout from cart' })
  checkout(@Body() dto: CheckoutDto, @CurrentUser('id') userId: string) {
    return this.ordersService.checkout(dto, userId);
  }

  @Get('orders/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get order by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Put('orders/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update an order' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  @Patch('orders/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Partially update an order' })
  partialUpdate(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  @Delete('orders/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete an order' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }
}
