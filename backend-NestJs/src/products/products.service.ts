import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../../db';
import { products } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { R2Service } from '../storage/r2.service';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>,
    private readonly r2: R2Service,
  ) {}

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

  async create(
    dto: CreateProductDto,
    files?: { imagen?: Express.Multer.File[]; imagenes_adicionales?: Express.Multer.File[] },
  ) {
    let imageUrl = dto.imageUrl;
    let additionalImages = dto.additionalImages;

    if (files?.imagen?.[0]) {
      imageUrl = await this.r2.uploadFile(files.imagen[0], 'products');
    }

    if (files?.imagenes_adicionales?.length) {
      additionalImages = await Promise.all(
        files.imagenes_adicionales.map((f) => this.r2.uploadFile(f, 'products')),
      );
    }

    const result = await this.db
      .insert(products)
      .values({
        name: dto.name,
        description: dto.description,
        price: dto.price.toString(),
        salePrice: dto.salePrice?.toString(),
        stock: dto.stock,
        categoryId: dto.categoryId,
        imageUrl,
        isActive: dto.isActive,
        isFeatured: dto.isFeatured,
        additionalImages,
      })
      .returning();
    return result[0];
  }

  async update(
    id: number,
    dto: UpdateProductDto,
    files?: { imagen?: Express.Multer.File[]; imagenes_adicionales?: Express.Multer.File[] },
  ) {
    const values: any = {};
    if (dto.name !== undefined) values.name = dto.name;
    if (dto.description !== undefined) values.description = dto.description;
    if (dto.price !== undefined) values.price = dto.price.toString();
    if (dto.salePrice !== undefined) values.salePrice = dto.salePrice.toString();
    if (dto.stock !== undefined) values.stock = dto.stock;
    if (dto.categoryId !== undefined) values.categoryId = dto.categoryId;
    if (dto.isActive !== undefined) values.isActive = dto.isActive;
    if (dto.isFeatured !== undefined) values.isFeatured = dto.isFeatured;

    if (files?.imagen?.[0]) {
      const existing = await this.findOneAdmin(id);
      if (existing?.imageUrl) await this.r2.deleteFile(existing.imageUrl);
      values.imageUrl = await this.r2.uploadFile(files.imagen[0], 'products');
    } else if (dto.imageUrl !== undefined) {
      values.imageUrl = dto.imageUrl;
    }

    if (files?.imagenes_adicionales?.length) {
      values.additionalImages = await Promise.all(
        files.imagenes_adicionales.map((f) => this.r2.uploadFile(f, 'products')),
      );
    } else if (dto.additionalImages !== undefined) {
      values.additionalImages = dto.additionalImages;
    }

    const result = await this.db.update(products).set(values).where(eq(products.id, id)).returning();
    return result[0] || null;
  }

  async remove(id: number) {
    const existing = await this.findOneAdmin(id);
    if (existing?.imageUrl) await this.r2.deleteFile(existing.imageUrl);
    const result = await this.db.delete(products).where(eq(products.id, id)).returning();
    return result[0] || null;
  }
}
