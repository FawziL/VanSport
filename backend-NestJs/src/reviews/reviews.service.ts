import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../../db';
import { reviews, products, user } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(@Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>) {}

  async findAll() {
    return this.db.select().from(reviews);
  }

  async findAllAdmin() {
    return this.db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        productName: products.name,
        userId: reviews.userId,
        userName: user.name,
        userLastName: user.lastName,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .leftJoin(products, eq(reviews.productId, products.id))
      .leftJoin(user, eq(reviews.userId, user.id));
  }

  async findOne(id: number) {
    const result = await this.db.select().from(reviews).where(eq(reviews.id, id));
    return result[0] || null;
  }

  async findByProduct(productId: number) {
    return this.db.select().from(reviews).where(eq(reviews.productId, productId));
  }

  async create(dto: CreateReviewDto, userId: string) {
    const result = await this.db.insert(reviews).values({ ...dto, userId }).returning();
    return result[0];
  }

  async update(id: number, dto: UpdateReviewDto, userId: string) {
    const result = await this.db
      .update(reviews)
      .set(dto)
      .where(and(eq(reviews.id, id), eq(reviews.userId, userId)))
      .returning();
    return result[0] || null;
  }

  async remove(id: number, userId: string) {
    const result = await this.db
      .delete(reviews)
      .where(and(eq(reviews.id, id), eq(reviews.userId, userId)))
      .returning();
    return result[0] || null;
  }

  async removeAdmin(id: number) {
    const result = await this.db.delete(reviews).where(eq(reviews.id, id)).returning();
    return result[0] || null;
  }

  async updateAdmin(id: number, dto: UpdateReviewDto) {
    const result = await this.db
      .update(reviews)
      .set(dto)
      .where(eq(reviews.id, id))
      .returning();
    return result[0] || null;
  }
}
