import { requireAuth } from "@/lib/auth-helpers";
import { getProject } from "@/queries/projects";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TaskStatusToggle } from "@/components/tasks/task-status-toggle";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  ON_HOLD: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-gray-100 text-gray-600",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const user = await requireAuth();
  const { projectId } = await params;
  const project = await getProject(user.id!, projectId);

  if (!project) notFound();

  return (
    <div className="p-6">
      <Link href="/projects" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </Link>

      <div className="mb-2 flex items-center gap-3">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Badge className={STATUS_COLORS[project.status] ?? ""} variant="secondary">
          {project.status.replace("_", " ")}
        </Badge>
      </div>

      {project.area && (
        <p className="mb-2 text-sm text-muted-foreground">
          Area: <Link href={`/areas/${project.area.id}`} className="text-primary hover:underline">{project.area.name}</Link>
        </p>
      )}

      {project.description && (
        <p className="mb-6 text-muted-foreground">{project.description}</p>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Tasks ({project.tasks.length})</h2>
        {project.tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks in this project yet.</p>
        ) : (
          <div className="space-y-2">
            {project.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <TaskStatusToggle taskId={task.id} status={task.status} />
                  <span className={task.status === "DONE" ? "line-through text-muted-foreground" : ""}>
                    {task.title}
                  </span>
                </div>
                <div className="flex gap-2">
                  {task.priority !== "NONE" && (
                    <Badge variant="outline">{task.priority}</Badge>
                  )}
                  {task.contact && (
                    <Badge variant="secondary">{task.contact.name}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
