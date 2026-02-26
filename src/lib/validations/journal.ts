import { z } from "zod";

export const createJournalSchema = z.object({
  content: z.string().min(1, "Content is required").max(10000),
  contactId: z.string().optional(),
});

export const updateJournalSchema = createJournalSchema.partial().extend({
  id: z.string().min(1),
});

export type CreateJournalInput = z.infer<typeof createJournalSchema>;
export type UpdateJournalInput = z.infer<typeof updateJournalSchema>;
