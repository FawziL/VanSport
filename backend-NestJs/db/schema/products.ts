import { pgTable, serial, text, decimal, integer, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { categories } from './categories';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal('sale_price', { precision: 10, scale: 2 }),
  stock: integer('stock').notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),
  additionalImages: jsonb('additional_images'),
  createdAt: timestamp('created_at').defaultNow(),
});
