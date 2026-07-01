import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartService } from '../../src/cart/cart.service';

const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    service = new CartService(mockDb as any);
    vi.clearAllMocks();
  });

  it('should add new item to cart', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 1, userId: 'u1', productId: 1, quantity: 2 }]),
      }),
    });

    const result = await service.addItem({ productId: 1, quantity: 2 }, 'u1');
    expect(result).toHaveProperty('id', 1);
    expect(result.quantity).toBe(2);
  });

  it('should update quantity when item already in cart', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ id: 1, userId: 'u1', productId: 1, quantity: 1 }]),
      }),
    });
    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 1, userId: 'u1', productId: 1, quantity: 3 }]),
        }),
      }),
    });

    const result = await service.addItem({ productId: 1, quantity: 2 }, 'u1');
    expect(result.quantity).toBe(3);
  });

  it('should clear cart', async () => {
    mockDb.delete.mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });

    const result = await service.clearCart('u1');
    expect(result).toEqual({ message: 'Cart cleared' });
  });

  it('should find items by user', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ id: 1, userId: 'u1', productId: 1, quantity: 1 }]),
      }),
    });

    const result = await service.findByUser('u1');
    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe('u1');
  });
});
