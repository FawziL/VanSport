import { pgTable, serial, text, boolean, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const paymentMethods = pgTable('payment_methods', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  description: text('description').default(''),
  instructions: text('instructions').default(''),
  config: jsonb('config').default({}),
  icon: text('icon').default(''),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
