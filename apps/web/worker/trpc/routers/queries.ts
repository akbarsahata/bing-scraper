import { scrapingTasksRepo } from "@repo/data/repos/scraping-tasks.repo";
import { searchQueriesRepo } from "@repo/data/repos/search-queries.repo";
import { searchResultsRepo } from "@repo/data/repos/search-results.repo";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";
import { t } from "../trpc-instance";

export const queriesRouter = t.router({
  getByQueryId: t.procedure
    .input(
      z.object({
        uploadedFileId: z.string(),
        queryId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const { queryId, uploadedFileId } = input;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      const query = await searchQueriesRepo.findById(db, queryId);

      if (!query) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Search query with ID ${queryId} not found`,
        });
      }

      const scrapeTask = await scrapingTasksRepo.getByUploadedFileIdAndQueryId(
        db,
        uploadedFileId,
        queryId
      );

      if (!scrapeTask) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Scraping task for uploaded file ID ${uploadedFileId} and query ID ${queryId} not found`,
        });
      }

      const taskId = scrapeTask.id;

      const queryResult = await searchResultsRepo.findByTaskIdAndQueryId(
        db,
        taskId,
        queryId
      );

      if (!queryResult) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Search results for query ID ${queryId} and task ID ${taskId} not found`,
        });
      }

      return {
        query,
        results: queryResult,
      };
    }),

  search: t.procedure
    .input(
      z.object({
        searchTerm: z.string().min(1),
        limit: z.number().min(1).max(100).optional(),
        offset: z.number().min(0).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      const results = await searchResultsRepo.searchAll(
        db,
        userId,
        input.searchTerm,
        {
          limit: input.limit,
          offset: input.offset,
        }
      );

      return results;
    }),

  getDownloadLinks: t.procedure
    .input(
      z.object({
        queryId: z.string(),
        taskId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, userId, env } = ctx;
      const { queryId, taskId } = input;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      const queryResult = await searchResultsRepo.findByTaskIdAndQueryId(
        db,
        taskId,
        queryId
      );

      if (!queryResult) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Search result not found",
        });
      }

      if (queryResult.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to access this resource",
        });
      }

      const links: { screenshotUrl?: string; htmlUrl?: string } = {};

      if (queryResult.r2ScreenshotKey) {
        const screenshotObj = await env.STORAGE.get(queryResult.r2ScreenshotKey);
        if (screenshotObj) {
          const url = new URL(ctx.req.url);
          links.screenshotUrl = `${url.protocol}//${url.host}/api/download?key=${encodeURIComponent(queryResult.r2ScreenshotKey)}&type=screenshot`;
        }
      }

      if (queryResult.r2HtmlKey) {
        const htmlObj = await env.STORAGE.get(queryResult.r2HtmlKey);
        if (htmlObj) {
          const url = new URL(ctx.req.url);
          links.htmlUrl = `${url.protocol}//${url.host}/api/download?key=${encodeURIComponent(queryResult.r2HtmlKey)}&type=html`;
        }
      }

      return links;
    }),
});
