import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(),
  isRead: boolean('is_read').default(false),
  relatedId: integer('related_id'),
  relatedType: text('related_type'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
});
