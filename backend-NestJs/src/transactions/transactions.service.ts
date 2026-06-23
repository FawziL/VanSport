import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../../db';
import { transactions } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PayTransactionDto } from './dto/pay-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(@Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>) {}

  async findByUser(userId: string) {
    return this.db
      .select()
      .from(transactions)
      .innerJoin(schema.orders, eq(transactions.orderId, schema.orders.id))
      .where(eq(schema.orders.userId, userId));
  }

  async findAll() {
    return this.db.select().from(transactions);
  }

  async findOne(id: number) {
    const result = await this.db.select().from(transactions).where(eq(transactions.id, id));
    return result[0] || null;
  }

  async create(dto: CreateTransactionDto) {
    const result = await this.db
      .insert(transactions)
      .values({
        orderId: dto.orderId,
        amount: dto.amount.toString(),
        paymentMethod: dto.paymentMethod,
        transactionCode: dto.transactionCode,
        reference: dto.reference,
        receipt: dto.receipt,
        paymentNotes: dto.paymentNotes,
        status: 'pending',
      })
      .returning();
    return result[0];
  }

  async pay(id: number, dto: PayTransactionDto) {
    const result = await this.db
      .update(transactions)
      .set({ ...dto, status: 'completed' })
      .where(eq(transactions.id, id))
      .returning();
    return result[0] || null;
  }

  async update(id: number, dto: Partial<CreateTransactionDto>) {
    const values: any = {};
    if (dto.orderId !== undefined) values.orderId = dto.orderId;
    if (dto.amount !== undefined) values.amount = dto.amount.toString();
    if (dto.paymentMethod !== undefined) values.paymentMethod = dto.paymentMethod;
    if (dto.transactionCode !== undefined) values.transactionCode = dto.transactionCode;
    if (dto.reference !== undefined) values.reference = dto.reference;
    if (dto.receipt !== undefined) values.receipt = dto.receipt;
    if (dto.paymentNotes !== undefined) values.paymentNotes = dto.paymentNotes;
    const result = await this.db.update(transactions).set(values).where(eq(transactions.id, id)).returning();
    return result[0] || null;
  }

  async remove(id: number) {
    const result = await this.db.delete(transactions).where(eq(transactions.id, id)).returning();
    return result[0] || null;
  }
}
