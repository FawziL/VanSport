import { pgTable, serial, integer, text, decimal, timestamp } from 'drizzle-orm/pg-core';
import { orders } from './orders';

export const shipments = pgTable('shipments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id),
  shippingMethod: text('shipping_method').notNull(),
  address: text('address'),
  shippedAt: timestamp('shipped_at'),
  estimatedDelivery: timestamp('estimated_delivery'),
  status: text('status').notNull(),
  trackingCode: text('tracking_code'),
  cost: decimal('cost', { precision: 10, scale: 2 }).notNull(),
});
