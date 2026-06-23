import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../../db';
import { cartItems } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateQuantityDto } from './dto/update-quantity.dto';

@Injectable()
export class CartService {
  constructor(@Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>) {}

  async findByUser(userId: string) {
    return this.db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async findOne(id: number, userId: string) {
    const result = await this.db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)));
    return result[0] || null;
  }

  async addItem(dto: AddItemDto, userId: string) {
    const existing = await this.db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, dto.productId)));

    if (existing.length > 0) {
      const result = await this.db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + dto.quantity })
        .where(eq(cartItems.id, existing[0].id))
        .returning();
      return result[0];
    }

    const result = await this.db
      .insert(cartItems)
      .values({ userId, productId: dto.productId, quantity: dto.quantity })
      .returning();
    return result[0];
  }

  async updateQuantity(dto: UpdateQuantityDto, userId: string) {
    const result = await this.db
      .update(cartItems)
      .set({ quantity: dto.quantity })
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, dto.productId)))
      .returning();
    return result[0] || null;
  }

  async removeItem(productId: number, userId: string) {
    const result = await this.db
      .delete(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
      .returning();
    return result[0] || null;
  }

  async clearCart(userId: string) {
    await this.db.delete(cartItems).where(eq(cartItems.userId, userId));
    return { message: 'Cart cleared' };
  }

  async remove(id: number, userId: string) {
    const result = await this.db
      .delete(cartItems)
      .where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)))
      .returning();
    return result[0] || null;
  }
}
