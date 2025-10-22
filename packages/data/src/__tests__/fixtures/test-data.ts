import type { NewUploadedFileSchema, UploadedFileSchema } from '@/zod/uploaded-files';
import type { NewSearchQuerySchema, SearchQuerySchema } from '@/zod/search-queries';
import type { NewSearchResultSchema } from '@/zod/search-results';
import type { NewSearchResultItemSchema } from '@/zod/search-result-items';
import type { NewScrapingTaskSchema, ScrapingTaskSchema } from '@/zod/scraping-tasks';

export const mockUploadedFileData: NewUploadedFileSchema = {
  id: 'file-123',
  userId: 'user-456',
  fileName: 'test-keywords.csv',
  r2Key: 'uploads/user-456/test-keywords.csv',
  r2Bucket: 'bing-scraper-storage',
  totalQueries: 5,
  processedQueries: 2,
  status: 'processing',
  uploadedAt: new Date('2025-01-01T10:00:00Z'),
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-01T10:00:00Z'),
};

export const mockUploadedFile: UploadedFileSchema = {
  ...mockUploadedFileData,
  totalQueries: mockUploadedFileData.totalQueries ?? 5,
  processedQueries: mockUploadedFileData.processedQueries ?? 2,
  status: 'processing',
  errorMessage: null,
  processedAt: new Date('2025-01-01T10:30:00Z'),
};

export const mockSearchQueryData: NewSearchQuerySchema = {
  id: 'query-789',
  uploadedFileId: 'file-123',
  userId: 'user-456',
  queryText: 'test search query',
  status: 'pending',
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-01T10:00:00Z'),
};

export const mockSearchQuery: SearchQuerySchema = {
  ...mockSearchQueryData,
  status: 'pending',
  retryCount: 0,
  maxRetries: 3,
  errorMessage: null,
};

export const mockScrapingTaskData: NewScrapingTaskSchema = {
  id: 'task-101',
  searchQueryId: 'query-789',
  uploadedFileId: 'file-123',
  userId: 'user-456',
  status: 'pending',
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-01T10:00:00Z'),
  metadata: null,
};

export const mockScrapingTask: ScrapingTaskSchema = {
  ...mockScrapingTaskData,
  status: 'completed',
  workflowId: 'workflow-abc',
  queueMessageId: 'msg-xyz',
  startedAt: new Date('2025-01-01T10:05:00Z'),
  completedAt: new Date('2025-01-01T10:15:00Z'),
  durationMs: 600000,
  retryCount: 0,
  errorMessage: null,
  metadata: null,
};

export const mockSearchResultData: NewSearchResultSchema = {
  id: 'result-202',
  taskId: 'task-101',
  queryId: 'query-789',
  userId: 'user-456',
  queryText: 'test search query',
  totalResults: 10,
  pageTitle: 'Test Search Results - Bing',
  searchUrl: 'https://bing.com/search?q=test+search+query',
  r2ScreenshotKey: 'screenshots/result-202.png',
  r2HtmlKey: 'html/result-202.html',
  scrapedAt: new Date('2025-01-01T10:15:00Z'),
  createdAt: new Date('2025-01-01T10:15:00Z'),
  updatedAt: new Date('2025-01-01T10:15:00Z'),
};

export const mockSearchResultItemData: NewSearchResultItemSchema = {
  id: 'item-303',
  searchResultId: 'result-202',
  queryId: 'query-789',
  position: 1,
  title: 'Test Search Result Title',
  url: 'https://example.com/test-result',
  displayUrl: 'example.com',
  snippet: 'This is a test search result snippet.',
  type: 'organic',
  domain: 'example.com',
  isAd: false,
  metadata: null,
  createdAt: new Date('2025-01-01T10:15:00Z'),
};

export const mockSearchQueries: NewSearchQuerySchema[] = [
  { ...mockSearchQueryData, id: 'query-1', queryText: 'query 1' },
  { ...mockSearchQueryData, id: 'query-2', queryText: 'query 2' },
  { ...mockSearchQueryData, id: 'query-3', queryText: 'query 3' },
];

export const mockSearchResultItems: NewSearchResultItemSchema[] = [
  { ...mockSearchResultItemData, id: 'item-1', position: 1, title: 'Result 1' },
  { ...mockSearchResultItemData, id: 'item-2', position: 2, title: 'Result 2' },
  { ...mockSearchResultItemData, id: 'item-3', position: 3, title: 'Result 3' },
];