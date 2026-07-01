import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';
import { products } from './products';

export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').notNull(),
  addedAt: timestamp('added_at').defaultNow(),
});
