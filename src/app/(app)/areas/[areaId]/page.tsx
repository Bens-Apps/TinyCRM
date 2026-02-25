import { requireAuth } from "@/lib/auth-helpers";
import { getArea } from "@/queries/areas";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FolderKanban, CheckSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function AreaDetailPage({
  params,
}: {
  params: Promise<{ areaId: string }>;
}) {
  const user = await requireAuth();
  const { areaId } = await params;
  const area = await getArea(user.id!, areaId);

  if (!area) notFound();

  return (
    <div className="p-6">
      <Link href="/areas" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Areas
      </Link>

      <div className="mb-6 flex items-center gap-3">
        {area.color && (
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: area.color }} />
        )}
        <h1 className="text-2xl font-bold">{area.name}</h1>
      </div>

      {area.description && (
        <p className="mb-6 text-muted-foreground">{area.description}</p>
      )}

      <div className="space-y-8">
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <FolderKanban className="h-5 w-5" /> Projects ({area.projects.length})
          </h2>
          {area.projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects in this area yet.</p>
          ) : (
            <div className="space-y-2">
              {area.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block rounded-lg border p-3 transition-colors hover:bg-muted"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{project.name}</span>
                    <Badge variant="secondary">{project.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <CheckSquare className="h-5 w-5" /> Open Tasks ({area.tasks.length})
          </h2>
          {area.tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open tasks in this area.</p>
          ) : (
            <div className="space-y-2">
              {area.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-lg border p-3">
                  <span>{task.title}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">{task.status}</Badge>
                    {task.priority !== "NONE" && (
                      <Badge variant="secondary">{task.priority}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
