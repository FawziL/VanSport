# Reviews Module

## What it does
Manages product reviews and ratings. Public users can read reviews; authenticated users can create, edit, and delete their own reviews.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/reviews` | None | List all reviews (filterable by productId) |
| GET | `/api/reviews/:id` | None | Get review by ID |
| POST | `/api/reviews` | Session | Create review |
| PUT | `/api/reviews/:id` | Session | Update own review |
| PATCH | `/api/reviews/:id` | Session | Partial update own review |
| DELETE | `/api/reviews/:id` | Session | Delete own review |

## How it works

### Read vs. Write separation
Reading reviews requires no authentication — anyone can see product ratings. Creating or modifying a review requires a valid session.

### Ownership enforcement
Update and delete operations filter by both `id` and `userId` to ensure users can only modify their own reviews:

```typescript
async update(id: number, dto: UpdateReviewDto, userId: string) {
  const result = await this.db
    .update(reviews)
    .set(dto)
    .where(and(eq(reviews.id, id), eq(reviews.userId, userId)))
    .returning();
  return result[0] || null;
}
```

### Product filtering
The `GET /api/reviews` endpoint accepts an optional `productId` query parameter:

```typescript
@Get()
async findAll(@Query('productId') productId?: string) {
  if (productId) {
    return this.reviewsService.findByProduct(parseInt(productId));
  }
  return this.reviewsService.findAll();
}
```

## Why this design
- **Public read access**: Reviews are social proof — they should be visible to everyone, including non-logged-in visitors browsing products.
- **Ownership enforcement**: Prevents users from modifying or deleting other users' reviews, maintaining review integrity.
- **Optional filtering**: The `productId` query parameter is the primary use case ("show me reviews for this product"), while the unfiltered endpoint supports admin review management.
