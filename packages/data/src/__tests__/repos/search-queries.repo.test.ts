import { describe, it, expect, beforeEach } from 'vitest';
import { searchQueriesRepo } from '@/repos/search-queries.repo';
import { createMockDb } from '../mocks/db.mock';
import { mockSearchQueryData, mockSearchQuery, mockSearchQueries } from '../fixtures/test-data';

const { db, mockHelpers } = createMockDb();

describe('searchQueriesRepo', () => {
  beforeEach(() => {
    mockHelpers.resetAllMocks();
  });

  describe('create', () => {
    it('should create a search query', async () => {
      mockHelpers.mockInsertReturning(mockSearchQuery);

      const result = await searchQueriesRepo.create(db as any, mockSearchQueryData);

      expect(result).toEqual(mockSearchQuery);
    });
  });

  describe('createMany', () => {
    it('should create multiple queries', async () => {
      mockHelpers.mockInsertMany(mockSearchQueries);

      const result = await searchQueriesRepo.createMany(db as any, mockSearchQueries);

      expect(result).toEqual(mockSearchQueries);
    });
  });

  describe('findById', () => {
    it('should return query when found', async () => {
      mockHelpers.mockQueryFirst('searchQueries', mockSearchQuery);

      const result = await searchQueriesRepo.findById(db as any, 'query-789');

      expect(result).toEqual(mockSearchQuery);
    });
  });

  describe('updateStatus', () => {
    it('should update status', async () => {
      const updated = { ...mockSearchQuery, status: 'completed' as const };
      mockHelpers.mockUpdateReturning(updated);

      const result = await searchQueriesRepo.updateStatus(db as any, 'query-789', 'completed');

      expect(result).toEqual(updated);
    });
  });

  describe('incrementRetryCount', () => {
    it('should increment retry count', async () => {
      const updated = { ...mockSearchQuery, retryCount: 1 };
      mockHelpers.mockUpdateReturning(updated);

      const result = await searchQueriesRepo.incrementRetryCount(db as any, 'query-789');

      expect(result).toEqual(updated);
    });
  });
});
