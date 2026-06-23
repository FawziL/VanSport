import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { OrdersService } from '../../src/orders/orders.service';

const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  transaction: vi.fn(),
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(() => {
    service = new OrdersService(mockDb as any);
    vi.clearAllMocks();
  });

  it('should create an order with items', async () => {
    const dto = {
      items: [
        { productId: 1, quantity: 2, unitPrice: 10 },
        { productId: 2, quantity: 1, unitPrice: 20 },
      ],
      shippingAddress: '123 Street',
    };

    const mockOrder = { id: 1, userId: 'u1', total: '40', shippingAddress: '123 Street' };

    mockDb.transaction.mockImplementation(async (cb: Function) => {
      return cb({
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockOrder]),
          }),
        }),
      });
    });

    const result = await service.create(dto as any, 'u1');
    expect(result).toEqual(mockOrder);
  });

  it('should checkout from cart', async () => {
    const dto = { shippingAddress: '123 Street' };

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            { productId: 1, quantity: 2, price: '10', salePrice: null },
            { productId: 2, quantity: 1, price: '20', salePrice: '15' },
          ]),
        }),
      }),
    });

    const mockOrder = { id: 1, userId: 'u1', total: '35', shippingAddress: '123 Street' };

    mockDb.transaction.mockImplementation(async (cb: Function) => {
      return cb({
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockOrder]),
          }),
        }),
        delete: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      });
    });

    const result = await service.checkout(dto as any, 'u1');
    expect(result).toEqual(mockOrder);
  });

  it('should throw when checkout with empty cart', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    await expect(service.checkout({}, 'u1')).rejects.toThrow(BadRequestException);
  });
});
