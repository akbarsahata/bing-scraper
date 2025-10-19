import type { Db } from "@/db/database";
import { searchQueries } from "@/schemas/search-queries";
import { NewSearchQuerySchema, SearchQuerySchema } from "@/zod/search-queries";
import { and, desc, eq, sql } from "drizzle-orm";

export const searchQueriesRepo = {
  create: async (
    db: Db,
    data: NewSearchQuerySchema
  ): Promise<SearchQuerySchema> => {
    const now = new Date();
    const query = await db
      .insert(searchQueries)
      .values({
        ...data,
        createdAt: data.createdAt || now,
        updatedAt: data.updatedAt || now,
      })
      .returning()
      .get();

    return query;
  },

  createMany: async (db: Db, queries: NewSearchQuerySchema[]) => {
    const now = new Date();
    const queriesToInsert = queries.map((q) => ({
      ...q,
      createdAt: q.createdAt || now,
      updatedAt: q.updatedAt || now,
    }));

    const inserted = await db
      .insert(searchQueries)
      .values(queriesToInsert)
      .returning()
      .all();

    return inserted;
  },

  findById: async (db: Db, id: string) => {
    return db.query.searchQueries.findFirst({
      where: eq(searchQueries.id, id),
    });
  },

  findByFileId: async (db: Db, uploadedFileId: string) => {
    return db
      .select()
      .from(searchQueries)
      .where(eq(searchQueries.uploadedFileId, uploadedFileId))
      .orderBy(desc(searchQueries.createdAt))
      .all();
  },

  findByUserId: async (db: Db, userId: string) => {
    return db
      .select()
      .from(searchQueries)
      .where(eq(searchQueries.userId, userId))
      .orderBy(desc(searchQueries.createdAt))
      .all();
  },

  findByStatus: async (db: Db, status: SearchQuerySchema["status"]) => {
    return db
      .select()
      .from(searchQueries)
      .where(eq(searchQueries.status, status))
      .orderBy(desc(searchQueries.createdAt))
      .all();
  },

  findByFileAndStatus: async (
    db: Db,
    uploadedFileId: string,
    status: SearchQuerySchema["status"]
  ) => {
    return db
      .select()
      .from(searchQueries)
      .where(
        and(
          eq(searchQueries.uploadedFileId, uploadedFileId),
          eq(searchQueries.status, status)
        )
      )
      .orderBy(desc(searchQueries.createdAt))
      .all();
  },

  updateStatus: async (
    db: Db,
    id: string,
    status: SearchQuerySchema["status"],
    errorMessage?: string
  ): Promise<SearchQuerySchema | undefined> => {
    return db
      .update(searchQueries)
      .set({
        status,
        errorMessage,
        updatedAt: new Date(),
      })
      .where(eq(searchQueries.id, id))
      .returning()
      .get();
  },

  incrementRetryCount: async (
    db: Db,
    id: string
  ): Promise<SearchQuerySchema | undefined> => {
    return db
      .update(searchQueries)
      .set({
        retryCount: sql`${searchQueries.retryCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(searchQueries.id, id))
      .returning()
      .get();
  },

  getStatsByFileId: async (
    db: Db,
    uploadedFileId: string
  ): Promise<{
    total: number;
    pending: number;
    queued: number;
    scraping: number;
    completed: number;
    failed: number;
  }> => {
    const stats = await db
      .select({
        status: searchQueries.status,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(searchQueries)
      .where(eq(searchQueries.uploadedFileId, uploadedFileId))
      .groupBy(searchQueries.status)
      .all();

    const result = {
      total: 0,
      pending: 0,
      queued: 0,
      scraping: 0,
      completed: 0,
      failed: 0,
    };

    stats.forEach((stat) => {
      const count = Number(stat.count);
      result.total += count;
      if (stat.status === "pending") result.pending = count;
      if (stat.status === "queued") result.queued = count;
      if (stat.status === "scraping") result.scraping = count;
      if (stat.status === "completed") result.completed = count;
      if (stat.status === "failed") result.failed = count;
    });

    return result;
  },

  delete: async (db: Db, id: string): Promise<void> => {
    await db.delete(searchQueries).where(eq(searchQueries.id, id));
  },

  deleteByFileId: async (db: Db, uploadedFileId: string): Promise<void> => {
    await db
      .delete(searchQueries)
      .where(eq(searchQueries.uploadedFileId, uploadedFileId));
  },
};
