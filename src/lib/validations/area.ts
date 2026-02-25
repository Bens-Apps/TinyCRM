import { z } from "zod";

export const createAreaSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  color: z.string().optional(),
});

export const updateAreaSchema = createAreaSchema.partial().extend({
  id: z.string().min(1),
  archived: z.boolean().optional(),
});

export type CreateAreaInput = z.infer<typeof createAreaSchema>;
export type UpdateAreaInput = z.infer<typeof updateAreaSchema>;
