import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../../db';
import { products } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(@Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>) {}

  async findAll() {
    return this.db.select().from(products).where(eq(products.isActive, true));
  }

  async findAllAdmin() {
    return this.db.select().from(products);
  }

  async findOne(id: number) {
    const result = await this.db.select().from(products).where(and(eq(products.id, id), eq(products.isActive, true)));
    return result[0] || null;
  }

  async findOneAdmin(id: number) {
    const result = await this.db.select().from(products).where(eq(products.id, id));
    return result[0] || null;
  }

  async create(dto: CreateProductDto) {
    const result = await this.db
      .insert(products)
      .values({
        name: dto.name,
        description: dto.description,
        price: dto.price.toString(),
        salePrice: dto.salePrice?.toString(),
        stock: dto.stock,
        categoryId: dto.categoryId,
        imageUrl: dto.imageUrl,
        isActive: dto.isActive,
        isFeatured: dto.isFeatured,
        additionalImages: dto.additionalImages,
      })
      .returning();
    return result[0];
  }

  async update(id: number, dto: UpdateProductDto) {
    const values: any = {};
    if (dto.name !== undefined) values.name = dto.name;
    if (dto.description !== undefined) values.description = dto.description;
    if (dto.price !== undefined) values.price = dto.price.toString();
    if (dto.salePrice !== undefined) values.salePrice = dto.salePrice.toString();
    if (dto.stock !== undefined) values.stock = dto.stock;
    if (dto.categoryId !== undefined) values.categoryId = dto.categoryId;
    if (dto.imageUrl !== undefined) values.imageUrl = dto.imageUrl;
    if (dto.isActive !== undefined) values.isActive = dto.isActive;
    if (dto.isFeatured !== undefined) values.isFeatured = dto.isFeatured;
    if (dto.additionalImages !== undefined) values.additionalImages = dto.additionalImages;
    const result = await this.db.update(products).set(values).where(eq(products.id, id)).returning();
    return result[0] || null;
  }

  async remove(id: number) {
    const result = await this.db.delete(products).where(eq(products.id, id)).returning();
    return result[0] || null;
  }
}
