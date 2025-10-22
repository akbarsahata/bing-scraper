import type { Db } from "@/db/database";
import { searchResultItems } from "@/schemas/search-result-items";
import { searchResults } from "@/schemas/search-results";
import { NewSearchResultItemSchema } from "@/zod/search-result-items";
import { NewSearchResultSchema } from "@/zod/search-results";
import { and, eq, like, or, desc } from "drizzle-orm";

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

  searchAll: async (
    db: Db,
    userId: string,
    searchTerm: string,
    options?: { limit?: number; offset?: number }
  ) => {
    const { limit = 50, offset = 0 } = options || {};

    const results = await db.query.searchResults.findMany({
      where: eq(searchResults.userId, userId),
      with: {
        items: {
          where: or(
            like(searchResultItems.title, `%${searchTerm}%`),
            like(searchResultItems.url, `%${searchTerm}%`),
            like(searchResultItems.snippet, `%${searchTerm}%`),
            like(searchResultItems.domain, `%${searchTerm}%`)
          ),
        },
      },
      orderBy: desc(searchResults.scrapedAt),
      limit,
      offset,
    });

    return results.filter(result => result.items.length > 0);
  },
};
