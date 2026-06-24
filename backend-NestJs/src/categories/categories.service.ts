import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../../db';
import { categories } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { R2Service } from '../storage/r2.service';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>,
    private readonly r2: R2Service,
  ) {}

  async findAll() {
    return this.db.select().from(categories);
  }

  async findOne(id: number) {
    const result = await this.db.select().from(categories).where(eq(categories.id, id));
    return result[0] || null;
  }

  async create(dto: CreateCategoryDto, file?: Express.Multer.File) {
    let imageUrl = dto.imageUrl;
    if (file) {
      imageUrl = await this.r2.uploadFile(file, 'categories');
    }
    const result = await this.db.insert(categories).values({ ...dto, imageUrl }).returning();
    return result[0];
  }

  async update(id: number, dto: UpdateCategoryDto, file?: Express.Multer.File) {
    const values: any = {};
    if (dto.name !== undefined) values.name = dto.name;
    if (dto.description !== undefined) values.description = dto.description;
    if (dto.isFeatured !== undefined) values.isFeatured = dto.isFeatured;

    if (file) {
      const existing = await this.findOne(id);
      if (existing?.imageUrl) await this.r2.deleteFile(existing.imageUrl);
      values.imageUrl = await this.r2.uploadFile(file, 'categories');
    } else if (dto.imageUrl !== undefined) {
      values.imageUrl = dto.imageUrl;
    }

    const result = await this.db.update(categories).set(values).where(eq(categories.id, id)).returning();
    return result[0] || null;
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    if (existing?.imageUrl) await this.r2.deleteFile(existing.imageUrl);
    const result = await this.db.delete(categories).where(eq(categories.id, id)).returning();
    return result[0] || null;
  }
}
