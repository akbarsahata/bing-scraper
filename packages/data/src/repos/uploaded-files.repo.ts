import {
  NewUploadedFileSchema,
  UploadedFileSchema,
} from "@/zod/uploaded-files";
import { and, desc, eq, sql } from "drizzle-orm";
import type { Db } from "../db/database";
import { uploadedFiles } from "../schemas/uploaded-files";

export const uploadedFilesRepo = {
  create: async (
    db: Db,
    data: NewUploadedFileSchema
  ): Promise<UploadedFileSchema> => {
    try {
      const [file] = await db.insert(uploadedFiles).values(data).returning();
      return file;
    } catch (error) {
      console.error("Error creating uploaded file:", error);
      throw error;
    }
  },

  getById: async (
    db: Db,
    id: string
  ) => {
    const file = await db.query.uploadedFiles.findFirst({
      where: eq(uploadedFiles.id, id),
      with: {
        searchQueries: true,
      },
    });
    return file;
  },

  getByR2Key: async (
    db: Db,
    r2Key: string
  ): Promise<UploadedFileSchema | undefined> => {
    const [file] = await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.r2Key, r2Key))
      .limit(1);
    return file;
  },

  getByUserId: async (
    db: Db,
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: "pending" | "processing" | "completed" | "failed";
    }
  ): Promise<UploadedFileSchema[]> => {
    const { limit = 50, offset = 0, status } = options || {};

    let query = db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.userId, userId))
      .orderBy(desc(uploadedFiles.uploadedAt))
      .limit(limit)
      .offset(offset);

    if (status) {
      query = db
        .select()
        .from(uploadedFiles)
        .where(
          and(
            eq(uploadedFiles.userId, userId),
            eq(uploadedFiles.status, status)
          )
        )
        .orderBy(desc(uploadedFiles.uploadedAt))
        .limit(limit)
        .offset(offset);
    }

    return await query;
  },

  getRecent: async (
    db: Db,
    userId: string,
    limit: number = 10
  ): Promise<UploadedFileSchema[]> => {
    return await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.userId, userId))
      .orderBy(desc(uploadedFiles.uploadedAt))
      .limit(limit);
  },

  update: async (
    db: Db,
    id: string,
    data: Partial<Omit<UploadedFileSchema, "id" | "userId" | "createdAt">>
  ): Promise<UploadedFileSchema | undefined> => {
    const [file] = await db
      .update(uploadedFiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(uploadedFiles.id, id))
      .returning();
    return file;
  },

  updateStatus: async (
    db: Db,
    id: string,
    status: "pending" | "processing" | "completed" | "failed",
    errorMessage?: string
  ): Promise<UploadedFileSchema | undefined> => {
    const updateData: Partial<UploadedFileSchema> = {
      status,
      updatedAt: new Date(),
    };

    if (status === "completed") {
      updateData.processedAt = new Date();
    }

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    const [file] = await db
      .update(uploadedFiles)
      .set(updateData)
      .where(eq(uploadedFiles.id, id))
      .returning();
    return file;
  },

  incrementProcessedQueries: async (
    db: Db,
    id: string,
    incrementBy: number = 1
  ): Promise<UploadedFileSchema | undefined> => {
    const [file] = await db
      .update(uploadedFiles)
      .set({
        processedQueries: sql`${uploadedFiles.processedQueries} + ${incrementBy}`,
        updatedAt: new Date(),
      })
      .where(eq(uploadedFiles.id, id))
      .returning();
    return file;
  },

  updateQueryCounts: async (
    db: Db,
    id: string,
    totalQueries: number,
    processedQueries: number
  ): Promise<UploadedFileSchema | undefined> => {
    const [file] = await db
      .update(uploadedFiles)
      .set({
        totalQueries,
        processedQueries,
        updatedAt: new Date(),
      })
      .where(eq(uploadedFiles.id, id))
      .returning();
    return file;
  },

  delete: async (db: Db, id: string): Promise<boolean> => {
    const result = await db
      .delete(uploadedFiles)
      .where(eq(uploadedFiles.id, id));
    return true;
  },

  deleteByUserId: async (db: Db, userId: string): Promise<number> => {
    const result = await db
      .delete(uploadedFiles)
      .where(eq(uploadedFiles.userId, userId));
    return 1;
  },

  getUserStats: async (
    db: Db,
    userId: string
  ): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> => {
    const files = await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.userId, userId));

    return {
      total: files.length,
      pending: files.filter((f) => f.status === "pending").length,
      processing: files.filter((f) => f.status === "processing").length,
      completed: files.filter((f) => f.status === "completed").length,
      failed: files.filter((f) => f.status === "failed").length,
    };
  },

  existsByR2Key: async (db: Db, r2Key: string): Promise<boolean> => {
    const [file] = await db
      .select({ id: uploadedFiles.id })
      .from(uploadedFiles)
      .where(eq(uploadedFiles.r2Key, r2Key))
      .limit(1);
    return !!file;
  },

  getByStatus: async (
    db: Db,
    status: "pending" | "processing" | "completed" | "failed",
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<UploadedFileSchema[]> => {
    const { limit = 50, offset = 0 } = options || {};

    return await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.status, status))
      .orderBy(desc(uploadedFiles.uploadedAt))
      .limit(limit)
      .offset(offset);
  },

  countByUser: async (db: Db, userId: string): Promise<number> => {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(uploadedFiles)
      .where(eq(uploadedFiles.userId, userId));
    return result.count;
  },

  getPendingFiles: async (
    db: Db,
    limit: number = 10
  ): Promise<UploadedFileSchema[]> => {
    return await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.status, "pending"))
      .orderBy(uploadedFiles.uploadedAt)
      .limit(limit);
  },
};
