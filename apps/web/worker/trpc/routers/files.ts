import { z } from "zod/v4";
import { t } from "../trpc-instance";

export const filesRouter = t.router({
  upload: t.procedure
    .input(
      z.object({
        fileName: z.string(),
        fileSize: z.number(),
        fileContent: z.string(), // Base64 encoded or will be handled separately
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { env } = ctx;
      const userId = ctx.userInfo.userId;

      // TODO: Implement R2 upload
      // TODO: Parse CSV and create search_queries entries
      // TODO: Create uploaded_files entry in D1

      // Mock response for now
      const fileId = `file_${Date.now()}`;
      
      return {
        fileId,
        fileName: input.fileName,
        status: "pending" as const,
        message: "File uploaded successfully (mock)",
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
      const { env } = ctx;
      const userId = ctx.userInfo.userId;

      // TODO: Query D1 for recent uploaded_files
      // Mock data for now
      return [
        {
          id: "1",
          fileName: "keywords_october.csv",
          uploadedAt: new Date("2025-10-21"),
          totalQueries: 100,
          processedQueries: 56,
          status: "processing" as const,
        },
        {
          id: "2",
          fileName: "search_terms.csv",
          uploadedAt: new Date("2025-10-18"),
          totalQueries: 150,
          processedQueries: 150,
          status: "completed" as const,
        },
      ];
    }),

  getById: t.procedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { env } = ctx;
      const userId = ctx.userInfo.userId;

      // TODO: Query D1 for uploaded_files by ID
      // Mock data for now
      return {
        id: input.fileId,
        fileName: "keywords_october.csv",
        uploadedAt: new Date("2025-10-21"),
        processedAt: null,
        totalQueries: 100,
        processedQueries: 56,
        status: "processing" as const,
        errorMessage: null,
      };
    }),
});
