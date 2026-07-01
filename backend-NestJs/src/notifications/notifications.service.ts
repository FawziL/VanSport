import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../../db';
import { notifications } from '../../db/schema';
import { eq, and, desc, isNull } from 'drizzle-orm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(@Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>) {}

  async findAll() {
    return this.db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async findOne(id: number) {
    const result = await this.db.select().from(notifications).where(eq(notifications.id, id));
    return result[0] || null;
  }

  async findLatestBanner() {
    const result = await this.db
      .select()
      .from(notifications)
      .where(and(eq(notifications.type, 'banner'), isNull(notifications.userId)))
      .orderBy(desc(notifications.createdAt))
      .limit(1);
    return result[0] || null;
  }

  async findByUser(userId: string) {
    return this.db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async create(dto: CreateNotificationDto) {
    const values: any = { ...dto };
    if (dto.expiresAt) {
      values.expiresAt = new Date(dto.expiresAt);
    } else {
      delete values.expiresAt;
    }
    const result = await this.db.insert(notifications).values(values).returning();
    return result[0];
  }

  async update(id: number, dto: UpdateNotificationDto) {
    const values: any = { ...dto };
    if (dto.expiresAt) values.expiresAt = new Date(dto.expiresAt);
    const result = await this.db.update(notifications).set(values).where(eq(notifications.id, id)).returning();
    return result[0] || null;
  }

  async remove(id: number) {
    const result = await this.db.delete(notifications).where(eq(notifications.id, id)).returning();
    return result[0] || null;
  }

  async markRead(id: number, userId: string) {
    const result = await this.db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();
    return result[0] || null;
  }
}
