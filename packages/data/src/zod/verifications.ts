import { verifications } from "@/schemas/verifications";
import { createSelectSchema } from "drizzle-zod";

export const verificationSchema = createSelectSchema(verifications);
export const newVerificationSchema = createSelectSchema(verifications);

export type VerificationSchema = typeof verificationSchema;
export type NewVerificationSchema = typeof newVerificationSchema;
