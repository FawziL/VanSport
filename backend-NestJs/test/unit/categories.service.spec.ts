import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CategoriesService } from '../../src/categories/categories.service';

const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(() => {
    service = new CategoriesService(mockDb as any);
    vi.clearAllMocks();
  });

  it('should find all categories', async () => {
    const mockSelect: any = vi.fn().mockReturnValue({ from: vi.fn().mockResolvedValue([{ id: 1, name: 'Test' }]) });
    mockDb.select.mockReturnValue({ from: vi.fn().mockResolvedValue([{ id: 1, name: 'Test' }]) });

    const result = await service.findAll();
    expect(result).toHaveLength(1);
    expect(mockDb.select).toHaveBeenCalled();
  });

  it('should find one category by id', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ id: 1, name: 'Test' }]),
      }),
    });

    const result = await service.findOne(1);
    expect(result).toEqual({ id: 1, name: 'Test' });
  });

  it('should return null when category not found', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });

    const result = await service.findOne(999);
    expect(result).toBeNull();
  });

  it('should create a category', async () => {
    const dto = { name: 'New Category', description: 'Desc' };
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 1, ...dto }]),
      }),
    });

    const result = await service.create(dto as any);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('should update a category', async () => {
    const dto = { name: 'Updated' };
    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: 1, name: 'Updated' }]),
        }),
      }),
    });

    const result = await service.update(1, dto as any);
    expect(result).toEqual({ id: 1, name: 'Updated' });
  });

  it('should delete a category', async () => {
    mockDb.delete.mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 1 }]),
      }),
    });

    const result = await service.remove(1);
    expect(result).toEqual({ id: 1 });
  });
});
