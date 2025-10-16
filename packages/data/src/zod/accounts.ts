import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { accounts } from "../schemas/accounts";

export const accountSchema = createSelectSchema(accounts);
export const newAccountSchema = createInsertSchema(accounts);

export type AccountSchema = z.infer<typeof accountSchema>;
export type NewAccountSchema = z.infer<typeof newAccountSchema>;
