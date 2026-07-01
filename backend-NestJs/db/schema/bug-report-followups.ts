import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { bugReports } from './bug-reports';

export const bugReportFollowups = pgTable('bug_report_followups', {
  id: serial('id').primaryKey(),
  bugReportId: integer('bug_report_id')
    .notNull()
    .references(() => bugReports.id, { onDelete: 'cascade' }),
  authorType: text('author_type').notNull(),
  message: text('message'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
});
