import { searchQueries } from "@/schemas/search-queries";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const searchQuerySchema = createSelectSchema(searchQueries);
export const newSearchQuerySchema = createInsertSchema(searchQueries);

export type SearchQuerySchema = z.infer<typeof searchQuerySchema>;
export type NewSearchQuerySchema = z.infer<typeof newSearchQuerySchema>;
