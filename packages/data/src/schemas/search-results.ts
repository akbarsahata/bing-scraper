import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { scrapingTasks } from "./scraping-tasks";
import { searchQueries } from "./search-queries";
import { users } from "./users";
import { searchResultItems } from "./search-result-items";

export const searchResults = sqliteTable(
  "search_results",
  {
    id: text("id").primaryKey(),
    taskId: text("task_id")
      .notNull()
      .references(() => scrapingTasks.id, { onDelete: "cascade" }),
    queryId: text("query_id")
      .notNull()
      .references(() => searchQueries.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    queryText: text("query_text").notNull(),
    totalResults: integer("total_results").default(0),
    pageTitle: text("page_title"),
    searchUrl: text("search_url"),
    scrapedAt: integer("scraped_at", { mode: "timestamp" }).notNull(),
    r2ScreenshotKey: text("r2_screenshot_key"),
    r2HtmlKey: text("r2_html_key"),
    metadata: text("metadata", { mode: "json" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    taskQueryUnique: unique().on(table.taskId, table.queryId),
  })
);

export const searchResultsRelations = relations(searchResults, ({ one, many }) => ({
  task: one(scrapingTasks, {
    fields: [searchResults.taskId],
    references: [scrapingTasks.id],
  }),
  query: one(searchQueries, {
    fields: [searchResults.queryId],
    references: [searchQueries.id],
  }),
  user: one(users, {
    fields: [searchResults.userId],
    references: [users.id],
  }),
  items: many(searchResultItems),
}));

export type SearchResult = typeof searchResults.$inferSelect;
export type NewSearchResult = typeof searchResults.$inferInsert;
