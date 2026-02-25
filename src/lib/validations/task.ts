import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "BLOCKED"]).optional(),
  priority: z.enum(["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional(),
  scheduledDate: z.string().optional(),
  projectId: z.string().optional(),
  areaId: z.string().optional(),
  contactId: z.string().optional(),
  tags: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().min(1),
});

export const updateTaskStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "BLOCKED"]),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
