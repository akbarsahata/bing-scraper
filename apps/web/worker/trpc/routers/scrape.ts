// import { z } from "zod/v4";
// import { t } from "../trpc-instance";
// import { TRPCError } from "@trpc/server";

// /**
//  * Router for triggering and managing scraping operations
//  */
// export const scrapeRouter = t.router({
//   /**
//    * Trigger scraping for a specific file
//    */
//   startTask: t.procedure
//     .input(z.object({ fileId: z.string() }))
//     .mutation(async ({ ctx, input }) => {
//       const { env } = ctx;
//       const userId = ctx.userInfo.userId;

//       // TODO: Create scraping_tasks entries for each search_query
//       // TODO: Queue tasks in Cloudflare Queue
//       // TODO: Return task ID
//       throw new TRPCError({
//         code: "NOT_IMPLEMENTED",
//         message: "Scraping task creation not yet implemented",
//       });
//     }),

//   /**
//    * Get scraping status for a task
//    */
//   getStatus: t.procedure
//     .input(z.object({ taskId: z.string() }))
//     .query(async ({ ctx, input }) => {
//       const { env } = ctx;
//       const userId = ctx.userInfo.userId;

//       // TODO: Query D1 for scraping_tasks status
//       // Mock data for now
//       return {
//         taskId: input.taskId,
//         status: "running" as const,
//         progress: {
//           total: 100,
//           completed: 48,
//           failed: 2,
//           pending: 50,
//         },
//         startedAt: new Date("2025-10-21T10:00:00Z"),
//         estimatedCompletion: new Date("2025-10-21T12:30:00Z"),
//       };
//     }),
// });
