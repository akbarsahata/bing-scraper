import { sessions } from "@/schemas/sessions";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sessionSchema = createSelectSchema(sessions);
export const newSessionSchema = createInsertSchema(sessions);

export type SessionSchema = z.infer<typeof sessionSchema>;
export type NewSessionSchema = z.infer<typeof newSessionSchema>;
