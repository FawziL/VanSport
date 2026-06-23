import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../../db';
import { orders, orderItems, cartItems, products } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class OrdersService {
  constructor(@Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>) {}

  async findByUser(userId: string) {
    return this.db.select().from(orders).where(eq(orders.userId, userId));
  }

  async findAll() {
    return this.db.select().from(orders);
  }

  async findOne(id: number) {
    const result = await this.db.select().from(orders).where(eq(orders.id, id));
    return result[0] || null;
  }

  async create(dto: CreateOrderDto, userId: string) {
    const total = dto.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    return this.db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          userId,
          total: total.toString(),
          shippingAddress: dto.shippingAddress,
          notes: dto.notes,
        })
        .returning();

      for (const item of dto.items) {
        await tx.insert(orderItems).values({
          orderId: order.id,
          productId: item.productId,
          unitPrice: item.unitPrice.toString(),
          quantity: item.quantity,
          subtotal: (item.unitPrice * item.quantity).toString(),
        });
      }

      return order;
    });
  }

  async checkout(dto: CheckoutDto, userId: string) {
    const userCart = await this.db
      .select({
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        price: products.price,
        salePrice: products.salePrice,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));

    if (userCart.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    let total = 0;
    for (const item of userCart) {
      const price = item.salePrice || item.price;
      total += parseFloat(price as string) * item.quantity;
    }

    return this.db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          userId,
          total: total.toString(),
          shippingAddress: dto.shippingAddress,
          notes: dto.notes,
        })
        .returning();

      for (const item of userCart) {
        const price = parseFloat((item.salePrice || item.price) as string);
        await tx.insert(orderItems).values({
          orderId: order.id,
          productId: item.productId,
          unitPrice: price.toString(),
          quantity: item.quantity,
          subtotal: (price * item.quantity).toString(),
        });
      }

      await tx.delete(cartItems).where(eq(cartItems.userId, userId));

      return order;
    });
  }

  async update(id: number, dto: UpdateOrderDto) {
    const result = await this.db.update(orders).set(dto).where(eq(orders.id, id)).returning();
    return result[0] || null;
  }

  async remove(id: number) {
    const result = await this.db.delete(orders).where(eq(orders.id, id)).returning();
    return result[0] || null;
  }
}
