import { searchQueriesRepo } from "@repo/data/repos/search-queries.repo";
import { uploadedFilesRepo } from "@repo/data/repos/uploaded-files.repo";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";
import { t } from "../trpc-instance";

export const filesRouter = t.router({
  upload: t.procedure
    .input(
      z.object({
        fileName: z.string(),
        fileSize: z.number(),
        fileContent: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { env, db } = ctx;

      const userId = ctx.userInfo.userId;

      const csvContent = atob(input.fileContent);

      const lines = csvContent.split(/\r?\n/).filter((line) => line.trim());

      if (lines.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "CSV file is empty",
        });
      }

      const headerRow = lines[0].trim().toLowerCase();
      const headers = headerRow.split(",").map((h) => h.trim());

      const keywordIndex = headers.indexOf("keyword");
      if (keywordIndex === -1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            'CSV must have a "keyword" column. Please use the template file.',
        });
      }

      const keywords: string[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(",").map((v) => v.trim());
        const keyword = values[keywordIndex]?.trim();

        if (keyword && keyword.length > 0) {
          keywords.push(keyword);
        }
      }

      if (keywords.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "CSV file contains no valid keywords",
        });
      }

      if (keywords.length > 100) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Too many keywords. Maximum 100 keywords allowed, found ${keywords.length}`,
        });
      }

      const fileName = `${Date.now()}_${userId}_${input.fileName}`;
      await env.STORAGE.put(fileName, input.fileContent, {
        customMetadata: {
          userId,
          originalFileName: input.fileName,
          keywordCount: keywords.length.toString(),
          uploadedAt: new Date().toISOString(),
        },
      });

      const fileId = `file_${crypto.randomUUID()}`;
      const now = new Date();

      const uploadedFile = await uploadedFilesRepo.create(db, {
        id: fileId,
        userId,
        fileName: input.fileName,
        r2Key: fileName,
        r2Bucket: "bing-scraper-storage",
        totalQueries: keywords.length,
        processedQueries: 0,
        status: "pending",
        uploadedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      const searchQueryRecords = keywords.map((keyword) => ({
        id: `query_${crypto.randomUUID()}`,
        uploadedFileId: fileId,
        userId,
        queryText: keyword,
        status: "pending" as const,
        retryCount: 0,
        maxRetries: 3,
        createdAt: now,
        updatedAt: now,
      }));

      await searchQueriesRepo.createMany(db, searchQueryRecords);

      return {
        fileId: uploadedFile.id,
        fileName: uploadedFile.fileName,
        r2Key: uploadedFile.r2Key,
        totalKeywords: uploadedFile.totalQueries,
        status: uploadedFile.status,
        message: `File uploaded successfully with ${keywords.length} keywords`,
      };
    }),
  getRecent: t.procedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(10),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const userId = ctx.userInfo.userId;

      const limit = input?.limit ?? 10;
      const files = await uploadedFilesRepo.getRecent(db, userId, limit);

      return files.map((file) => ({
        id: file.id,
        fileName: file.fileName,
        uploadedAt: file.uploadedAt,
        totalQueries: file.totalQueries,
        processedQueries: file.processedQueries,
        status: file.status,
      }));
    }),
  getAll: t.procedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(10),
        })
        .optional()
    )
    .query(async ({ ctx }) => {
      const { db } = ctx;
      const userId = ctx.userInfo.userId;

      const files = await uploadedFilesRepo.getAll(db, userId);

      return files.map((file) => ({
        id: file.id,
        fileName: file.fileName,
        uploadedAt: file.uploadedAt,
        totalQueries: file.totalQueries,
        processedQueries: file.processedQueries,
        status: file.status,
      }));
    }),

  getById: t.procedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const userId = ctx.userInfo.userId;

      const file = await uploadedFilesRepo.getById(db, input.fileId);

      if (!file) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }

      if (file.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      return {
        id: file.id,
        fileName: file.fileName,
        uploadedAt: file.uploadedAt,
        processedAt: file.processedAt,
        totalQueries: file.totalQueries,
        processedQueries: file.processedQueries,
        searchQueries: file.searchQueries,
        status: file.status,
        errorMessage: file.errorMessage,
      };
    }),
});
