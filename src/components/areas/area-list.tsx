"use client";

import { useState } from "react";
import { Plus, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaCard } from "./area-card";
import { AreaForm } from "./area-form";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteArea } from "@/actions/areas";
import { toast } from "sonner";
import type { Area } from "@prisma/client";

type AreaWithCount = Area & { _count: { projects: number; tasks: number } };

interface AreaListProps {
  areas: AreaWithCount[];
}

export function AreaList({ areas }: AreaListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editArea, setEditArea] = useState<Area | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Area | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteArea(deleteTarget.id);
    if (result.success) {
      toast.success("Area deleted");
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
          <h1 className="text-2xl font-bold tracking-tight">Areas</h1>
          <p className="text-sm text-muted-foreground">
            Organize your work into high-level areas of responsibility.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Area
        </Button>
      </div>

      {areas.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-12 w-12" />}
          title="No areas yet"
          description="Areas help you organize projects and tasks by responsibility."
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create your first area
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <AreaCard
              key={area.id}
              area={area}
              onEdit={() => {
                setEditArea(area);
                setFormOpen(true);
              }}
              onDelete={() => setDeleteTarget(area)}
            />
          ))}
        </div>
      )}

      <AreaForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditArea(null);
        }}
        area={editArea}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Area"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This won't delete associated projects or tasks, but they will be unlinked.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
