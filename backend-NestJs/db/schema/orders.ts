import { pgTable, serial, integer, timestamp, text, decimal } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  orderedAt: timestamp('ordered_at').defaultNow(),
  status: text('status').notNull().default('pending'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  shippingAddress: text('shipping_address'),
  notes: text('notes'),
});
