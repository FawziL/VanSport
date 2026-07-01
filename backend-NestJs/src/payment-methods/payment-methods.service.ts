import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../../db';
import { paymentMethods } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Injectable()
export class PaymentMethodsService {
  constructor(@Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>) {}

  async findAll() {
    return this.db.select().from(paymentMethods).where(eq(paymentMethods.isActive, true));
  }

  async findAllAdmin() {
    return this.db.select().from(paymentMethods);
  }

  async findOne(id: number) {
    const result = await this.db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
    return result[0] || null;
  }

  async create(dto: CreatePaymentMethodDto) {
    const result = await this.db.insert(paymentMethods).values(dto).returning();
    return result[0];
  }

  async update(id: number, dto: UpdatePaymentMethodDto) {
    const result = await this.db.update(paymentMethods).set(dto).where(eq(paymentMethods.id, id)).returning();
    return result[0] || null;
  }

  async remove(id: number) {
    const result = await this.db.delete(paymentMethods).where(eq(paymentMethods.id, id)).returning();
    return result[0] || null;
  }
}
