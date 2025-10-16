import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { searchQueries } from "./search-queries";
import { scrapingTasks } from "./scraping-tasks";

export const uploadedFiles = sqliteTable("uploaded_files", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  r2Key: text("r2_key").notNull().unique(),
  r2Bucket: text("r2_bucket").notNull(),
  totalQueries: integer("total_queries").default(0),
  processedQueries: integer("processed_queries").default(0),
  status: text("status", {
    enum: ["pending", "processing", "completed", "failed"],
  })
    .notNull()
    .default("pending"),
  errorMessage: text("error_message"),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" }).notNull(),
  processedAt: integer("processed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const uploadedFilesRelations = relations(uploadedFiles, ({ one, many }) => ({
  user: one(users, {
    fields: [uploadedFiles.userId],
    references: [users.id],
  }),
  searchQueries: many(searchQueries),
  scrapingTasks: many(scrapingTasks),
}));

export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type NewUploadedFile = typeof uploadedFiles.$inferInsert;
