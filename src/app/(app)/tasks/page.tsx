import { Suspense } from "react";
import { requireAuth } from "@/lib/auth-helpers";
import { getTasks } from "@/queries/tasks";
import { getAreas } from "@/queries/areas";
import { getProjects } from "@/queries/projects";
import { prisma } from "@/lib/prisma";
import { TaskList } from "@/components/tasks/task-list";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireAuth();
  const params = await searchParams;

  const [tasks, areas, projects, contacts] = await Promise.all([
    getTasks(user.id!, {
      status: params.status,
      priority: params.priority,
      areaId: params.areaId,
      projectId: params.projectId,
      tab: (params.tab as "all" | "today" | "this-week" | "next-week" | "overdue") ?? "all",
    }),
    getAreas(user.id!),
    getProjects(user.id!),
    prisma.contact.findMany({
      where: { userId: user.id! },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="p-6">
      <Suspense>
        <TaskList
          tasks={tasks}
          areas={areas}
          projects={projects}
          contacts={contacts}
          groupBy={params.groupBy ?? "status"}
        />
      </Suspense>
    </div>
  );
}
