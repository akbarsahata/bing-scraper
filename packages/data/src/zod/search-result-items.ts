import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { searchResultItems } from "../schemas/search-result-items";

export const searchResultItemSchema = createSelectSchema(searchResultItems);
export const newSearchResultItemSchema = createInsertSchema(searchResultItems);

export type SearchResultItemSchema = z.infer<typeof searchResultItemSchema>;
export type NewSearchResultItemSchema = z.infer<typeof newSearchResultItemSchema>;
