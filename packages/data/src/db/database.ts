import { D1Database } from "@cloudflare/workers-types";
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import * as accounts from "../schemas/accounts";
import * as scrapingTasks from "../schemas/scraping-tasks";
import * as searchQueries from "../schemas/search-queries";
import * as searchResultItems from "../schemas/search-result-items";
import * as seacrchResults from "../schemas/search-results";
import * as sessions from "../schemas/sessions";
import * as uploadedFiles from "../schemas/uploaded-files";
import * as users from "../schemas/users";

const schema = {
  ...accounts,
  ...sessions,
  ...users,
  ...scrapingTasks,
  ...searchQueries,
  ...seacrchResults,
  ...searchResultItems,
  ...uploadedFiles,
};

let db: DrizzleD1Database<typeof schema> | null = null;

export type Db = DrizzleD1Database<typeof schema>;

export function initDatabase(bindingDb: D1Database) {
  db = drizzle(bindingDb, {
    schema,
  });
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized");
  }

  return db;
}
