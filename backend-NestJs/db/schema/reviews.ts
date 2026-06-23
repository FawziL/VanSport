import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { products } from './products';
import { user } from './auth-schema';

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});
