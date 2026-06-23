import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../../db';
import { user } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(@Inject('DRIZZLE') private db: NodePgDatabase<typeof schema>) {}

  async findAll() {
    return this.db
      .select({
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        isStaff: user.isStaff,
        isActive: user.isActive,
        registeredAt: user.registeredAt,
      })
      .from(user);
  }

  async findOne(id: string) {
    const result = await this.db
      .select({
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        isStaff: user.isStaff,
        isActive: user.isActive,
        registeredAt: user.registeredAt,
      })
      .from(user)
      .where(eq(user.id, id));
    return result[0] || null;
  }

  async update(id: string, dto: UpdateProfileDto) {
    const result = await this.db
      .update(user)
      .set(dto)
      .where(eq(user.id, id))
      .returning({
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        isStaff: user.isStaff,
        isActive: user.isActive,
      });
    return result[0] || null;
  }

  async remove(id: string) {
    const result = await this.db.delete(user).where(eq(user.id, id)).returning({ id: user.id });
    return result[0] || null;
  }
}
