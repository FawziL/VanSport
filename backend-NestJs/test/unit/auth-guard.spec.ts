import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';

const mockGetSession = vi.hoisted(() => vi.fn());

vi.mock('../../src/auth/auth.setup', () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}));

vi.mock('better-auth/node', () => ({
  fromNodeHeaders: vi.fn((headers) => headers),
}));

import { AuthGuard } from '../../src/common/guards/auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    guard = new AuthGuard();
    mockGetSession.mockReset();
  });

  it('should allow access when session exists', async () => {
    const mockUser = { id: '1', name: 'Test', email: 'test@test.com' };
    const mockSession = { id: 's1' };
    mockGetSession.mockResolvedValue({ user: mockUser, session: mockSession });

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as any;

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException when no session', async () => {
    mockGetSession.mockResolvedValue(null);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as any;

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should attach user and session to request', async () => {
    const mockUser = { id: '2', name: 'Jane', email: 'jane@test.com' };
    const mockSession = { id: 's2' };
    mockGetSession.mockResolvedValue({ user: mockUser, session: mockSession });

    const req: any = { headers: {} };
    const context = {
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as any;

    await guard.canActivate(context);
    expect(req['user']).toEqual(mockUser);
    expect(req['session']).toEqual(mockSession);
  });
});
