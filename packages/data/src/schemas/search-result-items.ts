import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { searchResults } from "./search-results";
import { searchQueries } from "./search-queries";

export const searchResultItems = sqliteTable("search_result_items", {
  id: text("id").primaryKey(),
  searchResultId: text("search_result_id")
    .notNull()
    .references(() => searchResults.id, { onDelete: "cascade" }),
  queryId: text("query_id")
    .notNull()
    .references(() => searchQueries.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  displayUrl: text("display_url"),
  snippet: text("snippet"),
  type: text("type", {
    enum: ["organic", "ad", "featured", "news", "video"],
  }).default("organic"),
  domain: text("domain"),
  isAd: integer("is_ad", { mode: "boolean" }).default(false),
  metadata: text("metadata", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const searchResultItemsRelations = relations(searchResultItems, ({ one }) => ({
  searchResult: one(searchResults, {
    fields: [searchResultItems.searchResultId],
    references: [searchResults.id],
  }),
  query: one(searchQueries, {
    fields: [searchResultItems.queryId],
    references: [searchQueries.id],
  }),
}));

export type SearchResultItem = typeof searchResultItems.$inferSelect;
export type NewSearchResultItem = typeof searchResultItems.$inferInsert;
