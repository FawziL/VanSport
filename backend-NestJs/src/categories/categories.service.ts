import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../../db';
import { categories } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>) {}

  async findAll() {
    return this.db.select().from(categories);
  }

  async findOne(id: number) {
    const result = await this.db.select().from(categories).where(eq(categories.id, id));
    return result[0] || null;
  }

  async create(dto: CreateCategoryDto) {
    const result = await this.db.insert(categories).values(dto).returning();
    return result[0];
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const result = await this.db.update(categories).set(dto).where(eq(categories.id, id)).returning();
    return result[0] || null;
  }

  async remove(id: number) {
    const result = await this.db.delete(categories).where(eq(categories.id, id)).returning();
    return result[0] || null;
  }
}
