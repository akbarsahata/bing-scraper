import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import {
  destinationEvaluations,
  linkClicks,
  links,
} from "../schemas/schema";

const schema = {
  links,
  linkClicks,
  destinationEvaluations,
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
