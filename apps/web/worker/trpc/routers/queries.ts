import { z } from "zod/v4";
import { t } from "../trpc-instance";
import { TRPCError } from "@trpc/server";

export const queriesRouter = t.router({
  /**
   * Get all search queries for a specific task/file
   */
  listByTask: t.procedure
    .input(
      z.object({
        taskId: z.string(),
        status: z
          .enum(["pending", "queued", "scraping", "completed", "failed"])
          .optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { env } = ctx;
      const userId = ctx.userInfo.userId;

      // TODO: Query D1 for search_queries by uploaded_file_id
      // Mock data for now
      return {
        queries: [
          {
            id: "1",
            queryText: "keyword 6",
            status: "pending" as const,
            createdAt: new Date("2025-10-21"),
            retryCount: 0,
          },
          {
            id: "2",
            queryText: "keyword 5",
            status: "scraping" as const,
            createdAt: new Date("2025-10-21"),
            retryCount: 0,
          },
          {
            id: "3",
            queryText: "keyword 4",
            status: "scraping" as const,
            createdAt: new Date("2025-10-21"),
            retryCount: 0,
          },
          {
            id: "4",
            queryText: "keyword 3",
            status: "completed" as const,
            createdAt: new Date("2025-10-21"),
            retryCount: 0,
          },
          {
            id: "5",
            queryText: "keyword 2",
            status: "completed" as const,
            createdAt: new Date("2025-10-21"),
            retryCount: 0,
          },
          {
            id: "6",
            queryText: "keyword 1",
            status: "completed" as const,
            createdAt: new Date("2025-10-21"),
            retryCount: 0,
          },
        ],
        total: 6,
      };
    }),

  /**
   * Get search results for a specific query
   */
  getResults: t.procedure
    .input(z.object({ queryId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { env } = ctx;
      const userId = ctx.userInfo.userId;

      // TODO: Query D1 for search_results and search_result_items
      // Mock data for now
      return {
        id: "result-1",
        queryId: input.queryId,
        queryText: "keyword 1",
        totalResults: 10,
        scrapedAt: new Date("2025-10-21"),
        pageTitle: "keyword 1 - Bing Search",
        searchUrl: "https://www.bing.com/search?q=keyword+1",
        items: [
          {
            id: "item-1",
            position: 1,
            title: "Result Title 1",
            url: "https://example.com/result-1",
            displayUrl: "example.com/result-1",
            snippet: "This is a snippet of the first result...",
            type: "organic" as const,
            domain: "example.com",
            isAd: false,
          },
          {
            id: "item-2",
            position: 2,
            title: "Result Title 2 - Sponsored",
            url: "https://ads.example.com/result-2",
            displayUrl: "ads.example.com/result-2",
            snippet: "This is a sponsored result...",
            type: "ad" as const,
            domain: "ads.example.com",
            isAd: true,
          },
          {
            id: "item-3",
            position: 3,
            title: "Result Title 3",
            url: "https://example.org/result-3",
            displayUrl: "example.org/result-3",
            snippet: "This is another organic result...",
            type: "organic" as const,
            domain: "example.org",
            isAd: false,
          },
        ],
      };
    }),

  /**
   * Retry a failed query
   */
  retry: t.procedure
    .input(z.object({ queryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { env } = ctx;
      const userId = ctx.userInfo.userId;

      // TODO: Update query status to 'queued'
      // TODO: Re-queue the query in Cloudflare Queue
      throw new TRPCError({
        code: "NOT_IMPLEMENTED",
        message: "Query retry not yet implemented",
      });
    }),

  /**
   * Get query statistics
   */
  getStats: t.procedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { env } = ctx;
      const userId = ctx.userInfo.userId;

      // TODO: Aggregate query statistics from D1
      // Mock data for now
      return {
        total: 100,
        pending: 10,
        queued: 5,
        scraping: 3,
        completed: 80,
        failed: 2,
        averageDuration: 2500, // milliseconds
      };
    }),
});
