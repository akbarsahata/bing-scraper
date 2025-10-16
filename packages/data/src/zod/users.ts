import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { users } from "../schemas/users";

export const userSchema = createSelectSchema(users);
export const newUserSchema = createInsertSchema(users);

export type UserSchema = z.infer<typeof userSchema>;
export type NewUserSchema = z.infer<typeof newUserSchema>;
