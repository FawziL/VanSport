import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthController } from '../../src/auth/auth.controller';

const mockUsersService = {
  findOne: vi.fn(),
  update: vi.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(() => {
    controller = new AuthController(mockUsersService as any);
    vi.clearAllMocks();
  });

  it('should get profile', async () => {
    const user = { id: '1', name: 'Test' };
    mockUsersService.findOne.mockResolvedValue(user);

    const result = await controller.getProfile(user);
    expect(result).toEqual(user);
    expect(mockUsersService.findOne).toHaveBeenCalledWith('1');
  });

  it('should update profile', async () => {
    const dto = { name: 'Updated Name' };
    const updated = { id: '1', name: 'Updated Name' };
    mockUsersService.update.mockResolvedValue(updated);

    const result = await controller.updateProfile('1', dto as any);
    expect(result).toEqual(updated);
    expect(mockUsersService.update).toHaveBeenCalledWith('1', dto);
  });
});
