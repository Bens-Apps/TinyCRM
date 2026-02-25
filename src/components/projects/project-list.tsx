"use client";

import { useState } from "react";
import { Plus, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "./project-card";
import { ProjectForm } from "./project-form";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteProject } from "@/actions/projects";
import { toast } from "sonner";
import type { Project, Area } from "@prisma/client";

type ProjectWithRelations = Project & {
  area: { id: string; name: string; color: string | null } | null;
  _count: { tasks: number };
};

interface ProjectListProps {
  projects: ProjectWithRelations[];
  areas: Pick<Area, "id" | "name">[];
}

export function ProjectList({ projects, areas }: ProjectListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteProject(deleteTarget.id);
    if (result.success) {
      toast.success("Project deleted");
    } else {
      toast.error(result.error);
    }
    setDeleting(false);
    setDeleteTarget(null);
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage your projects.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-12 w-12" />}
          title="No projects yet"
          description="Projects help you track larger efforts within your areas."
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create your first project
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => {
                setEditProject(project);
                setFormOpen(true);
              }}
              onDelete={() => setDeleteTarget(project)}
            />
          ))}
        </div>
      )}

      <ProjectForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditProject(null);
        }}
        project={editProject}
        areas={areas}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Tasks will be unlinked.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
