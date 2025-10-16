import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { sessions } from "./sessions";
import { accounts } from "./accounts";
import { uploadedFiles } from "./uploaded-files";
import { searchQueries } from "./search-queries";
import { scrapingTasks } from "./scraping-tasks";
import { searchResults } from "./search-results";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  name: text("name"),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  uploadedFiles: many(uploadedFiles),
  searchQueries: many(searchQueries),
  scrapingTasks: many(scrapingTasks),
  searchResults: many(searchResults),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
