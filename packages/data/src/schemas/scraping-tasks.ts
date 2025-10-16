import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { searchQueries } from "./search-queries";
import { uploadedFiles } from "./uploaded-files";
import { users } from "./users";
import { searchResults } from "./search-results";

export const scrapingTasks = sqliteTable("scraping_tasks", {
  id: text("id").primaryKey(),
  searchQueryId: text("search_query_id")
    .notNull()
    .references(() => searchQueries.id, { onDelete: "cascade" }),
  uploadedFileId: text("uploaded_file_id")
    .notNull()
    .references(() => uploadedFiles.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status", {
    enum: ["pending", "queued", "running", "completed", "failed", "cancelled"],
  })
    .notNull()
    .default("pending"),
  workflowId: text("workflow_id"),
  queueMessageId: text("queue_message_id"),
  startedAt: integer("started_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  durationMs: integer("duration_ms"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  metadata: text("metadata", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const scrapingTasksRelations = relations(scrapingTasks, ({ one, many }) => ({
  searchQuery: one(searchQueries, {
    fields: [scrapingTasks.searchQueryId],
    references: [searchQueries.id],
  }),
  uploadedFile: one(uploadedFiles, {
    fields: [scrapingTasks.uploadedFileId],
    references: [uploadedFiles.id],
  }),
  user: one(users, {
    fields: [scrapingTasks.userId],
    references: [users.id],
  }),
  searchResults: many(searchResults),
}));

export type ScrapingTask = typeof scrapingTasks.$inferSelect;
export type NewScrapingTask = typeof scrapingTasks.$inferInsert;
