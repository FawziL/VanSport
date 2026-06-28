import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../../db';
import { user } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '../auth/auth.setup';
import { CreateUserDto } from './dto/create-user.dto';
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
        phone: user.phone,
        address: user.address,
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

  async create(dto: CreateUserDto) {
    const { name, lastName, email, password, phone, address, isActive, isStaff } = dto;
    try {
      const created = await auth.api.signUpEmail({
        body: { name, lastName, email, password },
        headers: new Headers(),
      });
      const userId = created.user?.id;
      if (!userId) throw new Error('No user id returned');

      const updates: Record<string, unknown> = {};
      if (phone !== undefined) updates.phone = phone;
      if (address !== undefined) updates.address = address;
      if (isActive !== undefined) updates.isActive = isActive;
      if (isStaff !== undefined) updates.isStaff = isStaff;
      if (Object.keys(updates).length > 0) {
        await this.db.update(user).set(updates).where(eq(user.id, userId));
      }

      return this.findOne(userId);
    } catch (err) {
      throw new InternalServerErrorException(err?.message || 'Error al crear usuario');
    }
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
