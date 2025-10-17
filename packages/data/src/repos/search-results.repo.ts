import { searchResults } from "@/schemas/search-results";
import { and, eq } from "drizzle-orm";
import type { Db } from "../db/database";

export const searchResultsRepo = {
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
};
