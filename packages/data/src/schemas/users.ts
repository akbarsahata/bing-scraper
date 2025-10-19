import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { sessions } from "./sessions";
import { accounts } from "./accounts";
import { uploadedFiles } from "./uploaded-files";
import { searchQueries } from "./search-queries";
import { scrapingTasks } from "./scraping-tasks";
import { searchResults } from "./search-results";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  uploadedFiles: many(uploadedFiles),
  searchQueries: many(searchQueries),
  scrapingTasks: many(scrapingTasks),
  searchResults: many(searchResults),
}));
