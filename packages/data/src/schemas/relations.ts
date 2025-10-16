import { relations } from "drizzle-orm";
import { users } from "./users";
import { sessions } from "./sessions";
import { accounts } from "./accounts";
import { uploadedFiles } from "./uploaded-files";
import { searchQueries } from "./search-queries";
import { scrapingTasks } from "./scraping-tasks";
import { searchResults } from "./search-results";
import { searchResultItems } from "./search-result-items";

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  uploadedFiles: many(uploadedFiles),
  searchQueries: many(searchQueries),
  scrapingTasks: many(scrapingTasks),
  searchResults: many(searchResults),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const uploadedFilesRelations = relations(uploadedFiles, ({ one, many }) => ({
  user: one(users, {
    fields: [uploadedFiles.userId],
    references: [users.id],
  }),
  searchQueries: many(searchQueries),
  scrapingTasks: many(scrapingTasks),
}));

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
