import { Db } from "@/db/database";
import { scrapingTasks } from "@/schemas/scraping-tasks";
import {
  NewScrapingTaskSchema,
  ScrapingTaskSchema,
} from "@/zod/scraping-tasks";
import { and, eq, sql } from "drizzle-orm";

export const scrapingTasksRepo = {
  create: async (db: Db, data: NewScrapingTaskSchema) => {
    const now = new Date();
    const task = await db
      .insert(scrapingTasks)
      .values({
        ...data,
        createdAt: data.createdAt || now,
        updatedAt: data.updatedAt || now,
      })
      .returning()
      .get();

    return task;
  },

  findById: async (db: Db, id: string) => {
    return db.query.scrapingTasks.findFirst({
      where: eq(scrapingTasks.id, id),
    });
  },

  getByUploadedFileIdAndQueryId: async (
    db: Db,
    uploadedFileId: string,
    queryId: string
  ) => {
    return db.query.scrapingTasks.findFirst({
      where: and(
        eq(scrapingTasks.uploadedFileId, uploadedFileId),
        eq(scrapingTasks.searchQueryId, queryId)
      ),
    });
  },

  updateStatus: async (
    db: Db,
    id: string,
    status: ScrapingTaskSchema["status"],
    errorMessage?: string
  ) => {
    return db
      .update(scrapingTasks)
      .set({
        status,
        errorMessage,
        updatedAt: new Date(),
      })
      .where(eq(scrapingTasks.id, id))
      .returning()
      .get();
  },

  markAsStarted: async (db: Db, id: string, workflowId: string) => {
    return db
      .update(scrapingTasks)
      .set({
        status: "running",
        workflowId,
        startedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(scrapingTasks.id, id))
      .returning()
      .get();
  },

  markAsCompleted: async (db: Db, id: string, durationMs: number) => {
    return db
      .update(scrapingTasks)
      .set({
        status: "completed",
        completedAt: new Date(),
        durationMs,
        updatedAt: new Date(),
      })
      .where(eq(scrapingTasks.id, id))
      .returning()
      .get();
  },

  markAsFailed: async (db: Db, id: string, errorMessage: string) => {
    return db
      .update(scrapingTasks)
      .set({
        status: "failed",
        errorMessage,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(scrapingTasks.id, id))
      .returning()
      .get();
  },

  incrementRetryCount: async (db: Db, id: string) => {
    return db
      .update(scrapingTasks)
      .set({
        retryCount: sql`${scrapingTasks.retryCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(scrapingTasks.id, id))
      .returning()
      .get();
  },
};
