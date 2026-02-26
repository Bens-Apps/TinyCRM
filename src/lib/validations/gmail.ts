import { z } from "zod";

export const sendEmailSchema = z.object({
  to: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Message body is required"),
  threadId: z.string().optional(),
  inReplyTo: z.string().optional(),
  references: z.string().optional(),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
