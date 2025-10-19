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
});
