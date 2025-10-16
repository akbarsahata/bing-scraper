import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";

import * as accounts from "../schemas/accounts";
import * as sessions from "../schemas/sessions";
import * as users from "../schemas/users";
import * as scrapingTasks from "../schemas/scraping-tasks";
import * as searchQueries from "../schemas/search-queries";
import * as seacrchResults from "../schemas/search-results";
import * as searchResultItems from "../schemas/search-result-items";
import * as uploadedFiles from "../schemas/uploaded-files";

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

export type Db = DrizzleD1Database<typeof schema>;
