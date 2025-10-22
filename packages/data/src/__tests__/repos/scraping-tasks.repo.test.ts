import { describe, it, expect, beforeEach } from 'vitest';
import { scrapingTasksRepo } from '@/repos/scraping-tasks.repo';
import { createMockDb } from '../mocks/db.mock';
import { mockScrapingTaskData, mockScrapingTask } from '../fixtures/test-data';

const { db, mockHelpers } = createMockDb();

describe('scrapingTasksRepo', () => {
  beforeEach(() => {
    mockHelpers.resetAllMocks();
  });

  describe('create', () => {
    it('should create a scraping task', async () => {
      mockHelpers.mockInsertReturning(mockScrapingTask);

      const result = await scrapingTasksRepo.create(db as any, mockScrapingTaskData);

      expect(result).toEqual(mockScrapingTask);
    });
  });

  describe('findById', () => {
    it('should return task when found', async () => {
      mockHelpers.mockQueryFirst('scrapingTasks', mockScrapingTask);

      const result = await scrapingTasksRepo.findById(db as any, 'task-101');

      expect(result).toEqual(mockScrapingTask);
    });
  });

  describe('getByUploadedFileIdAndQueryId', () => {
    it('should find task by file and query', async () => {
      mockHelpers.mockQueryFirst('scrapingTasks', mockScrapingTask);

      const result = await scrapingTasksRepo.getByUploadedFileIdAndQueryId(db as any, 'file-123', 'query-789');

      expect(result).toEqual(mockScrapingTask);
    });
  });

  describe('updateStatus', () => {
    it('should update status', async () => {
      const updated = { ...mockScrapingTask, status: 'completed' as const };
      mockHelpers.mockUpdateReturning(updated);

      const result = await scrapingTasksRepo.updateStatus(db as any, 'task-101', 'completed');

      expect(result).toEqual(updated);
    });
  });

  describe('markAsCompleted', () => {
    it('should mark as completed', async () => {
      const updated = { ...mockScrapingTask, status: 'completed' as const };
      mockHelpers.mockUpdateReturning(updated);

      const result = await scrapingTasksRepo.markAsCompleted(db as any, 'task-101', 1000);

      expect(result).toEqual(updated);
    });
  });

  describe('markAsFailed', () => {
    it('should mark as failed', async () => {
      const updated = { ...mockScrapingTask, status: 'failed' as const };
      mockHelpers.mockUpdateReturning(updated);

      const result = await scrapingTasksRepo.markAsFailed(db as any, 'task-101', 'error');

      expect(result).toEqual(updated);
    });
  });

  describe('incrementRetryCount', () => {
    it('should increment retry count', async () => {
      const updated = { ...mockScrapingTask, retryCount: 1 };
      mockHelpers.mockUpdateReturning(updated);

      const result = await scrapingTasksRepo.incrementRetryCount(db as any, 'task-101');

      expect(result).toEqual(updated);
    });
  });
});
