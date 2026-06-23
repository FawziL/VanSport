# Bug Reports Module

## What it does
Manages bug and issue reports submitted by users. Supports status tracking and follow-up conversations between users and support staff.

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/bug-reports` | Session | User's reports |
| POST | `/api/bug-reports` | Session | Create report |
| GET | `/api/bug-reports/:id` | Session | Get report |
| GET | `/api/bug-reports/:id/followups` | Session | Get follow-ups |
| PUT | `/api/bug-reports/:id` | Session | Update own report |
| PATCH | `/api/bug-reports/:id` | Session | Partial update |
| DELETE | `/api/bug-reports/:id` | Session | Delete own report |
| POST | `/api/bug-reports/:id/followups` | Session | Add follow-up |

## How it works

### Report structure
Each bug report has:
- `category`: Type of issue (e.g., "ui", "payment", "shipping")
- `section`: Where it occurred (e.g., "checkout", "product page")
- `title`, `description`: Human-readable details
- `imageUrl`, `videoUrl`: Media attachments for evidence
- `status`: Lifecycle state — `pending`, `in_review`, `resolved`

### Follow-up system
The `bugReportFollowups` table stores a conversation thread per report. The `authorType` field distinguishes between `user` and `support` responses:

```typescript
@Post(':id/followups')
async addFollowup(
  @Param('id') id: number,
  @Body() dto: AddFollowupDto,
  @CurrentUser('id') userId: string,
) {
  return this.bugReportsService.addFollowup(id, dto, 'user');
}
```

Admin follow-ups use `authorType = 'support'` via the admin endpoint.

### Ownership enforcement
Users can only view, update, and delete their own reports. Admin endpoints allow full access.

## Why this design
- **Self-service reporting**: Users can track their own bug reports and see support responses without email threads.
- **Rich attachments**: Image and video URL fields allow users to provide visual evidence of bugs.
- **Follow-up thread**: The separate followups table with `authorType` enables structured conversations that are easy to display chronologically.
- **Status lifecycle**: The `pending → in_review → resolved` flow matches standard issue tracking workflows.
