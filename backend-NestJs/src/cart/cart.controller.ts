import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateQuantityDto } from './dto/update-quantity.dto';
import { AuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get user cart items' })
  findAll(@CurrentUser('id') userId: string) {
    return this.cartService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cart item by ID' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: string) {
    return this.cartService.findOne(id, userId);
  }

  @Post('add')
  @ApiOperation({ summary: 'Add item to cart' })
  addItem(@Body() dto: AddItemDto, @CurrentUser('id') userId: string) {
    return this.cartService.addItem(dto, userId);
  }

  @Post('update-quantity')
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateQuantity(@Body() dto: UpdateQuantityDto, @CurrentUser('id') userId: string) {
    return this.cartService.updateQuantity(dto, userId);
  }

  @Post('remove')
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(@Body('productId', ParseIntPipe) productId: number, @CurrentUser('id') userId: string) {
    return this.cartService.removeItem(productId, userId);
  }

  @Post('clear')
  @ApiOperation({ summary: 'Clear user cart' })
  clearCart(@CurrentUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete cart item by ID' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: string) {
    return this.cartService.remove(id, userId);
  }
}
