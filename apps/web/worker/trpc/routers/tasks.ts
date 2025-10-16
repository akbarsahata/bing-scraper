// import { TRPCError } from "@trpc/server";
// import { z } from "zod/v4";
// import { t } from "../trpc-instance";

// export const tasksRouter = t.router({
//   getRecent: t.procedure
//     .input(
//       z.object({
//         limit: z.number().min(1).max(50).default(10),
//       })
//     )
//     .query(async ({ ctx, input }) => {
//       const { env } = ctx;
//       const userId = ctx.userInfo.userId;

//       // TODO: Query D1 for recent uploaded_files
//       // Mock data for now
//       return [
//         {
//           id: "1",
//           fileName: "keywords_october.csv",
//           uploadedAt: new Date("2025-10-21"),
//           totalQueries: 100,
//           processedQueries: 56,
//           status: "processing" as const,
//         },
//         {
//           id: "2",
//           fileName: "search_terms.csv",
//           uploadedAt: new Date("2025-10-18"),
//           totalQueries: 150,
//           processedQueries: 150,
//           status: "completed" as const,
//         },
//       ];
//     }),

//   /**
//    * Get all scraping tasks for the current user
//    */
//   list: t.procedure
//     .input(
//       z.object({
//         status: z
//           .enum([
//             "pending",
//             "queued",
//             "running",
//             "completed",
//             "failed",
//             "cancelled",
//           ])
//           .optional(),
//         limit: z.number().min(1).max(100).default(50),
//         offset: z.number().min(0).default(0),
//       })
//     )
//     .query(async ({ ctx, input }) => {
//       const { env } = ctx;
//       const userId = ctx.userInfo.userId;

//       // TODO: Query D1 for scraping_tasks
//       // TODO: Join with uploaded_files for file names
//       // Mock data for now
//       return {
//         tasks: [
//           {
//             id: "1",
//             fileName: "keywords_october.csv",
//             uploadedAt: new Date("2025-10-21"),
//             totalQueries: 100,
//             processedQueries: 48,
//             status: "running" as const,
//           },
//           {
//             id: "2",
//             fileName: "search_terms.csv",
//             uploadedAt: new Date("2025-10-18"),
//             totalQueries: 150,
//             processedQueries: 150,
//             status: "completed" as const,
//           },
//           {
//             id: "3",
//             fileName: "failed_test.csv",
//             uploadedAt: new Date("2025-10-13"),
//             totalQueries: 50,
//             processedQueries: 0,
//             status: "failed" as const,
//             errorMessage: "Failed to process file",
//           },
//           {
//             id: "4",
//             fileName: "keywords_sept.csv",
//             uploadedAt: new Date("2025-10-10"),
//             totalQueries: 200,
//             processedQueries: 200,
//             status: "completed" as const,
//           },
//           {
//             id: "5",
//             fileName: "keywords_aug.csv",
//             uploadedAt: new Date("2025-08-21"),
//             totalQueries: 180,
//             processedQueries: 180,
//             status: "completed" as const,
//           },
//         ],
//         total: 5,
//       };
//     }),

//   /**
//    * Get task details including all search queries
//    */
//   getById: t.procedure
//     .input(z.object({ taskId: z.string() }))
//     .query(async ({ ctx, input }) => {
//       const { env } = ctx;
//       const userId = ctx.userInfo.userId;

//       // TODO: Query D1 for uploaded_files by ID
//       // TODO: Join with search_queries
//       // Mock data for now
//       return {
//         id: input.taskId,
//         fileName: "keywords_october.csv",
//         uploadedAt: new Date("2025-10-21"),
//         processedAt: null,
//         totalQueries: 6,
//         processedQueries: 3,
//         status: "running" as const,
//         queries: [
//           {
//             id: "1",
//             queryText: "keyword 6",
//             status: "pending" as const,
//             createdAt: new Date("2025-10-21"),
//           },
//           {
//             id: "2",
//             queryText: "keyword 5",
//             status: "scraping" as const,
//             createdAt: new Date("2025-10-21"),
//           },
//           {
//             id: "3",
//             queryText: "keyword 4",
//             status: "scraping" as const,
//             createdAt: new Date("2025-10-21"),
//           },
//           {
//             id: "4",
//             queryText: "keyword 3",
//             status: "completed" as const,
//             createdAt: new Date("2025-10-21"),
//           },
//           {
//             id: "5",
//             queryText: "keyword 2",
//             status: "completed" as const,
//             createdAt: new Date("2025-10-21"),
//           },
//           {
//             id: "6",
//             queryText: "keyword 1",
//             status: "completed" as const,
//             createdAt: new Date("2025-10-21"),
//           },
//         ],
//       };
//     }),

//   /**
//    * Retry a failed task
//    */
//   retry: t.procedure
//     .input(z.object({ taskId: z.string() }))
//     .mutation(async ({ ctx, input }) => {
//       const { env } = ctx;
//       const userId = ctx.userInfo.userId;

//       // TODO: Update task status to 'queued'
//       // TODO: Re-queue failed queries
//       throw new TRPCError({
//         code: "NOT_IMPLEMENTED",
//         message: "Task retry not yet implemented",
//       });
//     }),

//   /**
//    * Cancel a running task
//    */
//   cancel: t.procedure
//     .input(z.object({ taskId: z.string() }))
//     .mutation(async ({ ctx, input }) => {
//       const { env } = ctx;
//       const userId = ctx.userInfo.userId;

//       // TODO: Update task status to 'cancelled'
//       // TODO: Cancel pending queries
//       throw new TRPCError({
//         code: "NOT_IMPLEMENTED",
//         message: "Task cancellation not yet implemented",
//       });
//     }),
// });
