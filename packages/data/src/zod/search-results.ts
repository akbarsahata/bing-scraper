import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { searchResults } from "../schemas/search-results";

export const searchResultSchema = createSelectSchema(searchResults);
export const newSearchResultSchema = createInsertSchema(searchResults);

export type SearchResultSchema = z.infer<typeof searchResultSchema>;
export type NewSearchResultSchema = z.infer<typeof newSearchResultSchema>;
