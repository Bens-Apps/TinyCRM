import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  company: z.string().max(100).optional(),
  relationshipTypeId: z.string().optional(),
  tags: z.string().optional(),
  notes: z.string().max(5000).optional(),
});

export const updateContactSchema = createContactSchema.partial().extend({
  id: z.string().min(1),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
