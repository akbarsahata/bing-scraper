import { scrapingTasks } from "@/schemas/scraping-tasks";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scrapingTaskSchema = createSelectSchema(scrapingTasks);
export const newScrapingTaskSchema = createInsertSchema(scrapingTasks);

export type ScrapingTaskSchema = z.infer<typeof scrapingTaskSchema>;
export type NewScrapingTaskSchema = z.infer<typeof newScrapingTaskSchema>;
