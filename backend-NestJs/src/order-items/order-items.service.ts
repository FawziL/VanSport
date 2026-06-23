import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../../db';
import { orderItems } from '../../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class OrderItemsService {
  constructor(@Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>) {}

  async findByOrder(orderId: number) {
    return this.db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async findAll() {
    return this.db.select().from(orderItems);
  }

  async findOne(id: number) {
    const result = await this.db.select().from(orderItems).where(eq(orderItems.id, id));
    return result[0] || null;
  }

  async remove(id: number) {
    const result = await this.db.delete(orderItems).where(eq(orderItems.id, id)).returning();
    return result[0] || null;
  }
}
