import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../../db';
import { shipments } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';

@Injectable()
export class ShipmentsService {
  constructor(@Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>) {}

  async findByUser(userId: string) {
    return this.db
      .select()
      .from(shipments)
      .innerJoin(schema.orders, eq(shipments.orderId, schema.orders.id))
      .where(eq(schema.orders.userId, userId));
  }

  async findAll() {
    return this.db.select().from(shipments);
  }

  async findByOrder(orderId: number) {
    return this.db.select().from(shipments).where(eq(shipments.orderId, orderId));
  }

  async findOne(id: number) {
    const result = await this.db.select().from(shipments).where(eq(shipments.id, id));
    return result[0] || null;
  }

  async create(dto: CreateShipmentDto) {
    const result = await this.db
      .insert(shipments)
      .values({
        orderId: dto.orderId,
        shippingMethod: dto.shippingMethod,
        status: dto.status,
        cost: dto.cost.toString(),
        address: dto.address,
        trackingCode: dto.trackingCode,
        shippedAt: dto.shippedAt ? new Date(dto.shippedAt) : null,
        estimatedDelivery: dto.estimatedDelivery ? new Date(dto.estimatedDelivery) : null,
      })
      .returning();
    return result[0];
  }

  async update(id: number, dto: UpdateShipmentDto) {
    const values: any = {};
    if (dto.orderId !== undefined) values.orderId = dto.orderId;
    if (dto.shippingMethod !== undefined) values.shippingMethod = dto.shippingMethod;
    if (dto.status !== undefined) values.status = dto.status;
    if (dto.cost !== undefined) values.cost = dto.cost.toString();
    if (dto.address !== undefined) values.address = dto.address;
    if (dto.trackingCode !== undefined) values.trackingCode = dto.trackingCode;
    if (dto.shippedAt !== undefined) values.shippedAt = new Date(dto.shippedAt);
    if (dto.estimatedDelivery !== undefined) values.estimatedDelivery = new Date(dto.estimatedDelivery);
    const result = await this.db.update(shipments).set(values).where(eq(shipments.id, id)).returning();
    return result[0] || null;
  }

  async remove(id: number) {
    const result = await this.db.delete(shipments).where(eq(shipments.id, id)).returning();
    return result[0] || null;
  }
}
