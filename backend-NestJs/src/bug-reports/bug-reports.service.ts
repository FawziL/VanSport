import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../../db';
import { bugReports, bugReportFollowups } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateBugReportDto } from './dto/create-bug-report.dto';
import { UpdateBugReportDto } from './dto/update-bug-report.dto';
import { AddFollowupDto } from './dto/add-followup.dto';

@Injectable()
export class BugReportsService {
  constructor(@Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>) {}

  async findByUser(userId: string) {
    return this.db.select().from(bugReports).where(eq(bugReports.userId, userId));
  }

  async findAll() {
    return this.db.select().from(bugReports);
  }

  async findOne(id: number) {
    const result = await this.db.select().from(bugReports).where(eq(bugReports.id, id));
    return result[0] || null;
  }

  async findFollowups(bugReportId: number) {
    return this.db
      .select()
      .from(bugReportFollowups)
      .where(eq(bugReportFollowups.bugReportId, bugReportId));
  }

  async create(dto: CreateBugReportDto, userId: string) {
    const result = await this.db.insert(bugReports).values({ ...dto, userId }).returning();
    return result[0];
  }

  async update(id: number, dto: UpdateBugReportDto, userId: string) {
    const result = await this.db
      .update(bugReports)
      .set({ ...dto, updatedAt: new Date() })
      .where(and(eq(bugReports.id, id), eq(bugReports.userId, userId)))
      .returning();
    return result[0] || null;
  }

  async remove(id: number, userId: string) {
    const result = await this.db
      .delete(bugReports)
      .where(and(eq(bugReports.id, id), eq(bugReports.userId, userId)))
      .returning();
    return result[0] || null;
  }

  async addFollowup(bugReportId: number, dto: AddFollowupDto, authorType: string) {
    const result = await this.db
      .insert(bugReportFollowups)
      .values({ bugReportId, authorType, ...dto })
      .returning();
    return result[0];
  }
}
