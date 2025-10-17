import { z } from "zod/v4";

// Base queue message schema
const BaseQueueMessageSchema = z.object({
  type: z.string(),
  data: z.unknown(),
});

// Email queue message schema
export const LinkClickMessageSchema = BaseQueueMessageSchema.extend({
  type: z.literal("LINK_CLICK"),
  data: z.object({
    id: z.string(),
    country: z.string().optional(),
    destination: z.string(),
    accountId: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    timestamp: z.string(),
  }),
});

export const LinkShareMessageSchema = BaseQueueMessageSchema.extend({
  type: z.literal("LINK_SHARE"),
  data: z.object({
    id: z.string(),
    accountId: z.string(),
    sharedTo: z.string(),
    sharedFrom: z.string().optional(),
    platform: z.string().optional(),
    timestamp: z.string(),
  }),
});

// Union of all queue message schemas
export const QueueMessageSchema = z.discriminatedUnion("type", [
  LinkClickMessageSchema,
  LinkShareMessageSchema,
]);

export type LinkClickMessageType = z.infer<typeof LinkClickMessageSchema>;
export type QueueMessageType = z.infer<typeof QueueMessageSchema>;
