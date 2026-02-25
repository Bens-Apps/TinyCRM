"use client";

import Link from "next/link";
import { FolderKanban, CheckSquare, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AreaCardProps {
  area: {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    _count: { projects: number; tasks: number };
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function AreaCard({ area, onEdit, onDelete }: AreaCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <Link href={`/areas/${area.id}`} className="flex-1">
          <div className="flex items-center gap-2">
            {area.color && (
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: area.color }} />
            )}
            <CardTitle className="text-base">{area.name}</CardTitle>
          </div>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {area.description && (
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{area.description}</p>
        )}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FolderKanban className="h-3.5 w-3.5" />
            {area._count.projects} projects
          </span>
          <span className="flex items-center gap-1">
            <CheckSquare className="h-3.5 w-3.5" />
            {area._count.tasks} tasks
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
