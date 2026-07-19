import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../../db';
import { orders, orderItems, cartItems, products, shipments, transactions as txTable } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CheckoutDto } from './dto/checkout.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class OrdersService {
  constructor(@Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>) {}

  async exportExcel(): Promise<Buffer> {
    const rows = await this.db.select().from(orders);

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Pedidos');

    ws.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Usuario ID', key: 'userId', width: 30 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Dirección', key: 'shippingAddress', width: 40 },
      { header: 'Notas', key: 'notes', width: 30 },
      { header: 'Fecha', key: 'orderedAt', width: 20 },
    ];

    ws.getRow(1).font = { bold: true };

    for (const r of rows) {
      ws.addRow({
        ...r,
        total: r.total ? parseFloat(r.total) : '',
        orderedAt: r.orderedAt ? new Date(r.orderedAt).toISOString().slice(0, 19).replace('T', ' ') : '',
      });
    }

    const buf = await wb.xlsx.writeBuffer();
    return Buffer.from(buf);
  }

  async findByUser(userId: string) {
    return this.db.select().from(orders).where(eq(orders.userId, userId));
  }

  async findAll() {
    return this.db.select().from(orders);
  }

  async findOne(id: number) {
    const [order] = await this.db.select().from(orders).where(eq(orders.id, id));
    if (!order) return null;

    const items = await this.db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        productName: products.name,
        unitPrice: orderItems.unitPrice,
        quantity: orderItems.quantity,
        subtotal: orderItems.subtotal,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id));

    const [lastTx] = await this.db
      .select()
      .from(txTable)
      .where(eq(txTable.orderId, id))
      .orderBy(desc(txTable.createdAt))
      .limit(1);

    return { ...order, detalles: items, ultima_transaccion: lastTx || null };
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

      const shippingMethod = dto.deliveryMethod === 'pickup' ? 'pickup' : 'delivery';
      const address = dto.deliveryMethod === 'pickup' ? null : (dto.shippingAddress || null);
      await tx.insert(shipments).values({
        orderId: order.id,
        shippingMethod,
        address,
        status: 'pending',
        cost: '0',
      });

      return order;
    });
  }

  async update(id: number, dto: UpdateOrderDto) {
    const values: any = {};
    if (dto.status !== undefined) values.status = dto.status;
    if (dto.shippingAddress !== undefined) values.shippingAddress = dto.shippingAddress;
    if (dto.notes !== undefined) values.notes = dto.notes;

    const result = await this.db.update(orders).set(values).where(eq(orders.id, id)).returning();
    return result[0] || null;
  }

  async remove(id: number) {
    const result = await this.db.delete(orders).where(eq(orders.id, id)).returning();
    return result[0] || null;
  }
}
