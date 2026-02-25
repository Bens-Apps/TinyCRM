import { requireAuth } from "@/lib/auth-helpers";
import { getProjects } from "@/queries/projects";
import { getAreas } from "@/queries/areas";
import { ProjectList } from "@/components/projects/project-list";

export default async function ProjectsPage() {
  const user = await requireAuth();
  const [projects, areas] = await Promise.all([
    getProjects(user.id!),
    getAreas(user.id!),
  ]);

  return (
    <div className="p-6">
      <ProjectList projects={projects} areas={areas} />
    </div>
  );
}
