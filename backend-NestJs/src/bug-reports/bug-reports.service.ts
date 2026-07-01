import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../../db';
import { bugReports, bugReportFollowups } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateBugReportDto } from './dto/create-bug-report.dto';
import { UpdateBugReportDto } from './dto/update-bug-report.dto';
import { AddFollowupDto } from './dto/add-followup.dto';
import { R2Service } from '../storage/r2.service';

@Injectable()
export class BugReportsService {
  constructor(
    @Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>,
    private readonly r2: R2Service,
  ) {}

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

  async create(
    dto: CreateBugReportDto,
    userId: string,
    files?: { imagen?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    let imageUrl = dto.imageUrl;
    let videoUrl = dto.videoUrl;

    if (files?.imagen?.[0]) {
      imageUrl = await this.r2.uploadFile(files.imagen[0], 'bug-reports');
    }
    if (files?.video?.[0]) {
      videoUrl = await this.r2.uploadFile(files.video[0], 'bug-reports/videos');
    }

    const result = await this.db
      .insert(bugReports)
      .values({ ...dto, imageUrl, videoUrl, userId })
      .returning();
    return result[0];
  }

  async update(
    id: number,
    dto: UpdateBugReportDto,
    userId: string,
    files?: { imagen?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    const values: any = { updatedAt: new Date() };
    if (dto.category !== undefined) values.category = dto.category;
    if (dto.title !== undefined) values.title = dto.title;
    if (dto.description !== undefined) values.description = dto.description;
    if (dto.section !== undefined) values.section = dto.section;

    if (files?.imagen?.[0]) {
      const existing = await this.findOne(id);
      if (existing?.imageUrl) await this.r2.deleteFile(existing.imageUrl);
      values.imageUrl = await this.r2.uploadFile(files.imagen[0], 'bug-reports');
    } else if (dto.imageUrl !== undefined) {
      values.imageUrl = dto.imageUrl;
    }

    if (files?.video?.[0]) {
      const existing = await this.findOne(id);
      if (existing?.videoUrl) await this.r2.deleteFile(existing.videoUrl);
      values.videoUrl = await this.r2.uploadFile(files.video[0], 'bug-reports/videos');
    } else if (dto.videoUrl !== undefined) {
      values.videoUrl = dto.videoUrl;
    }

    const result = await this.db
      .update(bugReports)
      .set(values)
      .where(and(eq(bugReports.id, id), eq(bugReports.userId, userId)))
      .returning();
    return result[0] || null;
  }

  async remove(id: number, userId: string) {
    const existing = await this.findOne(id);
    if (existing?.imageUrl) await this.r2.deleteFile(existing.imageUrl);
    if (existing?.videoUrl) await this.r2.deleteFile(existing.videoUrl);
    const result = await this.db
      .delete(bugReports)
      .where(and(eq(bugReports.id, id), eq(bugReports.userId, userId)))
      .returning();
    return result[0] || null;
  }

  async addFollowup(
    bugReportId: number,
    dto: AddFollowupDto,
    authorType: string,
    file?: Express.Multer.File,
  ) {
    let imageUrl = dto.imageUrl;
    if (file) {
      imageUrl = await this.r2.uploadFile(file, 'bug-reports/followups');
    }
    const result = await this.db
      .insert(bugReportFollowups)
      .values({ bugReportId, authorType, ...dto, imageUrl })
      .returning();
    return result[0];
  }
}
