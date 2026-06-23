import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export const bugReports = pgTable('bug_reports', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  category: text('category').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  section: text('section').notNull(),
  imageUrl: text('image_url'),
  videoUrl: text('video_url'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
