"use client";

import { useState } from "react";
import { Plus, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  createRelationshipType,
  deleteRelationshipType,
  reorderRelationshipTypes,
} from "@/actions/relationship-types";
import { toast } from "sonner";
import type { RelationshipType } from "@prisma/client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type RTWithCount = RelationshipType & { _count: { contacts: number } };

function SortableItem({ rt, onDelete }: { rt: RTWithCount; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: rt.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2">
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: rt.color ?? "#6b7280" }} />
      <span className="flex-1 font-medium text-sm">{rt.name}</span>
      <Badge variant="secondary" className="text-xs">{rt._count.contacts} contacts</Badge>
      <button onClick={onDelete} className="text-muted-foreground hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

interface RelationshipTypeListProps {
  types: RTWithCount[];
}

export function RelationshipTypeList({ types: initialTypes }: RelationshipTypeListProps) {
  const [types, setTypes] = useState(initialTypes);
  const [newName, setNewName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<RTWithCount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleAdd() {
    if (!newName.trim()) return;
    const formData = new FormData();
    formData.set("name", newName.trim());
    const result = await createRelationshipType(formData);
    if (result.success) {
      toast.success("Type added");
      setNewName("");
    } else {
      toast.error(result.error);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = types.findIndex((t) => t.id === active.id);
    const newIndex = types.findIndex((t) => t.id === over.id);

    const reordered = [...types];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    setTypes(reordered);

    await reorderRelationshipTypes(reordered.map((t) => t.id));
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteRelationshipType(deleteTarget.id);
    if (result.success) {
      setTypes((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      toast.success("Type deleted");
    } else {
      toast.error(result.error);
    }
    setDeleting(false);
    setDeleteTarget(null);
  }

  return (
    <>
      <h2 className="text-lg font-semibold">Relationship Types</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Drag to reorder. These categories organize your contacts.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={types.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {types.map((rt) => (
              <SortableItem key={rt.id} rt={rt} onDelete={() => setDeleteTarget(rt)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-4 flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New type name..."
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={!newName.trim()}>
          <Plus className="mr-2 h-4 w-4" /> Add
        </Button>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Relationship Type"
        description={`Delete "${deleteTarget?.name}"? Contacts using this type will be unlinked.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
