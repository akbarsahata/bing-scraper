// import { t } from "@/worker/trpc/trpc-instance";
// import {
//   createLink,
//   getMyLink,
//   getMyLinks,
//   updateLinkDestinations,
// } from "@repo/data-ops/queries/links";
// import {
//   createLinkSchema,
//   destinationsSchema,
// } from "@repo/data-ops/zod-schema/links";
// import { z } from "zod";

// import { TRPCError } from "@trpc/server";
// import { ACTIVE_LINKS_LAST_HOUR, LAST_30_DAYS_BY_COUNTRY } from "./dummy-data";

// export const linksTrpcRoutes = t.router({
//   linkList: t.procedure
//     .input(
//       z.object({
//         offset: z.number().optional(),
//       })
//     )
//     .query(async ({ ctx }) => {
//       return getMyLinks({
//         db: ctx.db,
//         accountId: ctx.userInfo.userId,
//         offset: 0,
//       });
//     }),
//   createLink: t.procedure
//     .input(createLinkSchema)
//     .mutation(async ({ ctx, input }) => {
//       return createLink({
//         db: ctx.db,
//         data: { ...input, accountId: ctx.userInfo.userId },
//       });
//     }),
//   updateLinkName: t.procedure
//     .input(
//       z.object({
//         linkId: z.string(),
//         name: z.string().min(1).max(300),
//       })
//     )
//     .mutation(async ({ input }) => {
//       console.log(input.linkId, input.name);
//     }),
//   getLink: t.procedure
//     .input(
//       z.object({
//         linkId: z.string(),
//       })
//     )
//     .query(async ({ ctx, input }) => {
//       const data = await getMyLink({
//         db: ctx.db,
//         accountId: ctx.userInfo.userId,
//         linkId: input.linkId,
//       });
//       if (!data) throw new TRPCError({ code: "NOT_FOUND" });
//       return data;
//     }),
//   updateLinkDestinations: t.procedure
//     .input(
//       z.object({
//         linkId: z.string(),
//         destinations: destinationsSchema,
//       })
//     )
//     .mutation(async ({ ctx, input }) => {
//       return updateLinkDestinations({
//         db: ctx.db,
//         linkId: input.linkId,
//         destinations: input.destinations,
//       });
//     }),
//   activeLinks: t.procedure.query(async () => {
//     return ACTIVE_LINKS_LAST_HOUR;
//   }),
//   totalLinkClickLastHour: t.procedure.query(async () => {
//     return 13;
//   }),
//   last24HourClicks: t.procedure.query(async () => {
//     return {
//       last24Hours: 56,
//       previous24Hours: 532,
//       percentChange: 12,
//     };
//   }),
//   last30DaysClicks: t.procedure.query(async () => {
//     return 78;
//   }),
//   clicksByCountry: t.procedure.query(async () => {
//     return LAST_30_DAYS_BY_COUNTRY;
//   }),
// });
