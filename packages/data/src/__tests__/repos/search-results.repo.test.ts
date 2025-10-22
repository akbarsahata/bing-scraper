import { describe, it, expect, beforeEach } from 'vitest';
import { searchResultsRepo } from '@/repos/search-results.repo';
import { createMockDb } from '../mocks/db.mock';
import { mockSearchResultData, mockSearchResultItems } from '../fixtures/test-data';

const { db, mockHelpers } = createMockDb();

describe('searchResultsRepo', () => {
  beforeEach(() => {
    mockHelpers.resetAllMocks();
  });

  describe('create', () => {
    it('should create search result', async () => {
      const expectedResult = { ...mockSearchResultData, items: mockSearchResultItems };
      mockHelpers.mockInsertReturning(mockSearchResultData);
      mockHelpers.mockInsertMany(mockSearchResultItems);

      const result = await searchResultsRepo.create(db as any, mockSearchResultData, mockSearchResultItems);

      expect(result).toBeDefined();
    });
  });

  describe('findById', () => {
    it('should return result when found', async () => {
      mockHelpers.mockQueryFirst('searchResults', mockSearchResultData);

      const result = await searchResultsRepo.findById(db as any, 'result-202');

      expect(result).toEqual(mockSearchResultData);
    });
  });

  describe('findByTaskIdAndQueryId', () => {
    it('should find by task and query', async () => {
      mockHelpers.mockQueryFirst('searchResults', mockSearchResultData);

      const result = await searchResultsRepo.findByTaskIdAndQueryId(db as any, 'task-101', 'query-789');

      expect(result).toEqual(mockSearchResultData);
    });
  });

  describe('findByQueryId', () => {
    it('should return empty array when none found', async () => {
      mockHelpers.mockQueryMany('searchResults', []);

      const result = await searchResultsRepo.findByQueryId(db as any, 'query-789');

      expect(result).toEqual([]);
    });
  });
});
