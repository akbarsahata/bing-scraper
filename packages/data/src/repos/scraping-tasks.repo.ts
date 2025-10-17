import { Db } from "@/db/database";
import { scrapingTasks } from "@/schemas/scraping-tasks";
import { and, eq } from "drizzle-orm";

export const scrapingTasksRepo = {
  getByUploadedFileIdAndQueryId: async (
    db: Db,
    uploadedFileId: string,
    queryId: string
  ) => {
    return db.query.scrapingTasks.findFirst({
      where: and(
        eq(scrapingTasks.uploadedFileId, uploadedFileId),
        eq(scrapingTasks.searchQueryId, queryId)
      ),
    });
  },
};
