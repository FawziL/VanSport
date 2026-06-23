# Notifications Module

## What it does
Manages system notifications — both global announcements (banners) and user-specific messages.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/notifications` | None | List global notifications |
| GET | `/api/notifications/latest-banner` | None | Get latest banner |
| GET | `/api/notifications/:id` | None | Get notification by ID |
| POST | `/api/notifications` | Session | Create notification |
| PUT | `/api/notifications/:id` | Session | Update notification |
| PATCH | `/api/notifications/:id` | Session | Partial update |
| DELETE | `/api/notifications/:id` | Session | Delete notification |
| POST | `/api/notifications/:id/mark-read` | Session | Mark as read |

## How it works

### Banner system
The `latest-banner` endpoint returns the most recent notification of type `banner` that has no `userId` (global scope):

```typescript
async findLatestBanner() {
  const result = await this.db
    .select()
    .from(notifications)
    .where(and(eq(notifications.type, 'banner'), isNull(notifications.userId)))
    .orderBy(desc(notifications.createdAt))
    .limit(1);
  return result[0] || null;
}
```

### User vs. Global notifications
- **Global**: Notifications with `userId = null` are visible to all users (e.g., site-wide announcements).
- **Personal**: Notifications with a `userId` are specific to that user (e.g., order confirmations).

### Mark as Read
The `mark_read` endpoint updates the `isRead` flag scoped to the authenticated user:

```typescript
async markRead(id: number, userId: string) {
  return this.db.update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}
```

## Why this design
- **Dual-purpose table**: A single `notifications` table handles both global banners and user-specific messages, reducing schema complexity.
- **Nullable userId**: Using `null` for global notifications avoids a separate `banners` table and simplifies queries.
- **Latest-banner optimization**: The `limit(1)` query with proper indexing ensures fast banner retrieval even with thousands of notifications.
- **Ownership check on mark-read**: The `and` condition ensures users can only mark their own notifications as read, even if they guess other notification IDs.
