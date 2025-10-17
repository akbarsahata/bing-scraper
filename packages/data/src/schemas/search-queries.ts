import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { uploadedFiles } from "./uploaded-files";
import { users } from "./users";
import { scrapingTasks } from "./scraping-tasks";
import { searchResults } from "./search-results";
import { searchResultItems } from "./search-result-items";

export const searchQueries = sqliteTable("search_queries", {
  id: text("id").primaryKey(),
  uploadedFileId: text("uploaded_file_id")
    .notNull()
    .references(() => uploadedFiles.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  queryText: text("query_text").notNull(),
  status: text("status", {
    enum: ["pending", "queued", "scraping", "completed", "failed"],
  })
    .notNull()
    .default("pending"),
  retryCount: integer("retry_count").default(0),
  maxRetries: integer("max_retries").default(3),
  errorMessage: text("error_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const searchQueriesRelations = relations(searchQueries, ({ one, many }) => ({
  uploadedFile: one(uploadedFiles, {
    fields: [searchQueries.uploadedFileId],
    references: [uploadedFiles.id],
  }),
  user: one(users, {
    fields: [searchQueries.userId],
    references: [users.id],
  }),
  scrapingTasks: many(scrapingTasks),
  searchResults: many(searchResults),
  searchResultItems: many(searchResultItems),
}));