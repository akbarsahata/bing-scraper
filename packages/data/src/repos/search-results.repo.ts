import type { Db } from "@/db/database";
import { searchResultItems } from "@/schemas/search-result-items";
import { searchResults } from "@/schemas/search-results";
import { NewSearchResultItemSchema } from "@/zod/search-result-items";
import { NewSearchResultSchema } from "@/zod/search-results";
import { and, eq } from "drizzle-orm";

export const searchResultsRepo = {
  create: async (
    db: Db,
    resultData: NewSearchResultSchema,
    items: NewSearchResultItemSchema[]
  ) => {
    const now = new Date();

    // Insert search result
    const result = await db
      .insert(searchResults)
      .values({
        ...resultData,
        createdAt: resultData.createdAt || now,
        updatedAt: resultData.updatedAt || now,
      })
      .returning()
      .get();

    // Insert result items
    if (items.length > 0) {
      await db.insert(searchResultItems).values(
        items.map((item) => ({
          ...item,
          searchResultId: result.id,
          createdAt: item.createdAt || now,
        }))
      );
    }

    return result;
  },

  findById: async (db: Db, id: string) => {
    return db.query.searchResults.findFirst({
      where: eq(searchResults.id, id),
      with: {
        items: true,
      },
    });
  },

  findByTaskIdAndQueryId: async (db: Db, taskId: string, queryId: string) => {
    return db.query.searchResults.findFirst({
      where: and(
        eq(searchResults.taskId, taskId),
        eq(searchResults.queryId, queryId)
      ),
      with: {
        items: true,
      },
    });
  },

  findByQueryId: async (db: Db, queryId: string) => {
    return db
      .select()
      .from(searchResults)
      .where(eq(searchResults.queryId, queryId))
      .all();
  },
};
