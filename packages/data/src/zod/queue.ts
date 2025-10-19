import { z } from "zod/v4";

export const ScrapingQueueMessageSchema = z.object({
  type: z.literal("SCRAPE_QUERY"),
  data: z.object({
    queryId: z.string(),
    uploadedFileId: z.string(),
    userId: z.string(),
    queryText: z.string(),
    retryCount: z.number().default(0),
  }),
});

export type ScrapingQueueMessage = z.infer<typeof ScrapingQueueMessageSchema>;
