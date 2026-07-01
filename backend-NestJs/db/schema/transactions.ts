import { pgTable, serial, integer, decimal, text, timestamp } from 'drizzle-orm/pg-core';
import { orders } from './orders';

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text('payment_method').notNull(),
  status: text('status').notNull(),
  transactionCode: text('transaction_code').notNull(),
  reference: text('reference').default(''),
  receipt: text('receipt'),
  paymentNotes: text('payment_notes').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});
