import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../../db';
import { transactions } from '../../db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PayTransactionDto } from './dto/pay-transaction.dto';
import { R2Service } from '../storage/r2.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>,
    private readonly r2: R2Service,
  ) {}

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

  async exportExcel(startDate?: string, endDate?: string): Promise<Buffer> {
    const conditions: any[] = [];
    if (startDate) conditions.push(gte(transactions.createdAt, new Date(startDate)));
    if (endDate) conditions.push(lte(transactions.createdAt, new Date(endDate)));

    const qb = this.db
      .select({
        id: transactions.id,
        orderId: transactions.orderId,
        amount: transactions.amount,
        paymentMethod: transactions.paymentMethod,
        status: transactions.status,
        transactionCode: transactions.transactionCode,
        reference: transactions.reference,
        paymentNotes: transactions.paymentNotes,
        createdAt: transactions.createdAt,
      })
      .from(transactions);

    if (conditions.length) qb.where(and(...conditions));
    const rows = await qb;

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Transacciones');

    ws.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Pedido ID', key: 'orderId', width: 12 },
      { header: 'Monto', key: 'amount', width: 15 },
      { header: 'Método', key: 'paymentMethod', width: 20 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Código', key: 'transactionCode', width: 25 },
      { header: 'Referencia', key: 'reference', width: 20 },
      { header: 'Notas', key: 'paymentNotes', width: 30 },
      { header: 'Fecha', key: 'createdAt', width: 20 },
    ];

    ws.getRow(1).font = { bold: true };

    for (const r of rows) {
      ws.addRow({
        ...r,
        amount: r.amount ? parseFloat(r.amount) : '',
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 19).replace('T', ' ') : '',
      });
    }

    const buf = await wb.xlsx.writeBuffer();
    return Buffer.from(buf);
  }

  async findOne(id: number) {
    const result = await this.db.select().from(transactions).where(eq(transactions.id, id));
    return result[0] || null;
  }

  async create(dto: CreateTransactionDto, file?: Express.Multer.File) {
    let receipt = dto.receipt;
    if (file) {
      receipt = await this.r2.uploadFile(file, 'transactions');
    }
    const result = await this.db
      .insert(transactions)
      .values({
        orderId: dto.orderId,
        amount: dto.amount.toString(),
        paymentMethod: dto.paymentMethod,
        transactionCode: dto.transactionCode,
        reference: dto.reference,
        receipt,
        paymentNotes: dto.paymentNotes,
        status: 'pending',
      })
      .returning();
    return result[0];
  }

  async pay(id: number, dto: PayTransactionDto, file?: Express.Multer.File) {
    const values: any = { status: 'completed' };
    if (dto.reference !== undefined) values.reference = dto.reference;
    if (dto.paymentNotes !== undefined) values.paymentNotes = dto.paymentNotes;

    if (file) {
      values.receipt = await this.r2.uploadFile(file, 'transactions');
    } else if (dto.receipt !== undefined) {
      values.receipt = dto.receipt;
    }

    const result = await this.db
      .update(transactions)
      .set(values)
      .where(eq(transactions.id, id))
      .returning();
    return result[0] || null;
  }

  async update(id: number, dto: Partial<CreateTransactionDto>, file?: Express.Multer.File) {
    const values: any = {};
    if (dto.orderId !== undefined) values.orderId = dto.orderId;
    if (dto.amount !== undefined) values.amount = dto.amount.toString();
    if (dto.paymentMethod !== undefined) values.paymentMethod = dto.paymentMethod;
    if (dto.transactionCode !== undefined) values.transactionCode = dto.transactionCode;
    if (dto.reference !== undefined) values.reference = dto.reference;
    if (dto.paymentNotes !== undefined) values.paymentNotes = dto.paymentNotes;

    if (file) {
      values.receipt = await this.r2.uploadFile(file, 'transactions');
    } else if (dto.receipt !== undefined) {
      values.receipt = dto.receipt;
    }

    const result = await this.db.update(transactions).set(values).where(eq(transactions.id, id)).returning();
    return result[0] || null;
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    if (existing?.receipt) await this.r2.deleteFile(existing.receipt);
    const result = await this.db.delete(transactions).where(eq(transactions.id, id)).returning();
    return result[0] || null;
  }
}
