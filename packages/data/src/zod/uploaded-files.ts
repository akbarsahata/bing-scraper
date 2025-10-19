import { uploadedFiles } from "@/schemas/uploaded-files";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const uploadedFileSchema = createSelectSchema(uploadedFiles);
export const newUploadedFileSchema = createInsertSchema(uploadedFiles);

export type UploadedFileSchema = z.infer<typeof uploadedFileSchema>;
export type NewUploadedFileSchema = z.infer<typeof newUploadedFileSchema>;
