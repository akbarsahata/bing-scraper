import { describe, it, expect, beforeEach } from 'vitest';
import { uploadedFilesRepo } from '@/repos/uploaded-files.repo';
import { createMockDb } from '../mocks/db.mock';
import { mockUploadedFileData, mockUploadedFile } from '../fixtures/test-data';

const { db, mockHelpers } = createMockDb();

describe('uploadedFilesRepo', () => {
  beforeEach(() => {
    mockHelpers.resetAllMocks();
  });

  describe('create', () => {
    it('should create a new uploaded file', async () => {
      mockHelpers.mockInsertReturning(mockUploadedFile);

      const result = await uploadedFilesRepo.create(db as any, mockUploadedFileData);

      expect(result).toEqual(mockUploadedFile);
    });
  });

  describe('getById', () => {
    it('should return uploaded file when found', async () => {
      mockHelpers.mockQueryFirst('uploadedFiles', mockUploadedFile);

      const result = await uploadedFilesRepo.getById(db as any, 'file-123');

      expect(result).toEqual(mockUploadedFile);
    });
  });

  describe('getByUserId', () => {
    it('should return files for user', async () => {
      mockHelpers.mockSelectMany([mockUploadedFile]);

      const result = await uploadedFilesRepo.getByUserId(db as any, 'user-456');

      expect(result).toEqual([mockUploadedFile]);
    });
  });

  describe('update', () => {
    it('should update file', async () => {
      const updated = { ...mockUploadedFile, processedQueries: 10 };
      mockHelpers.mockUpdateReturning(updated);

      const result = await uploadedFilesRepo.update(db as any, 'file-123', { processedQueries: 10 });

      expect(result).toEqual(updated);
    });
  });

  describe('updateStatus', () => {
    it('should update status', async () => {
      const updated = { ...mockUploadedFile, status: 'completed' as const };
      mockHelpers.mockUpdateReturning(updated);

      const result = await uploadedFilesRepo.updateStatus(db as any, 'file-123', 'completed');

      expect(result).toEqual(updated);
    });
  });

  describe('incrementProcessedQueries', () => {
    it('should increment count', async () => {
      const updated = { ...mockUploadedFile, processedQueries: 3 };
      mockHelpers.mockUpdateReturning(updated);

      const result = await uploadedFilesRepo.incrementProcessedQueries(db as any, 'file-123');

      expect(result).toEqual(updated);
    });
  });
});
