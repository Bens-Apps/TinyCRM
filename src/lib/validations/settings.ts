import { z } from "zod";

export const createRelationshipTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  color: z.string().optional(),
});

export const updateRelationshipTypeSchema = createRelationshipTypeSchema.partial().extend({
  id: z.string().min(1),
});

export const reorderRelationshipTypesSchema = z.object({
  orderedIds: z.array(z.string()),
});

export type CreateRelationshipTypeInput = z.infer<typeof createRelationshipTypeSchema>;
export type UpdateRelationshipTypeInput = z.infer<typeof updateRelationshipTypeSchema>;
