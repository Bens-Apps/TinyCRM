"use client";

import Link from "next/link";
import { CheckSquare, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  ON_HOLD: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-gray-100 text-gray-600",
};

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    area: { id: string; name: string; color: string | null } | null;
    _count: { tasks: number };
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <Link href={`/projects/${project.id}`} className="flex-1">
          <CardTitle className="text-base">{project.name}</CardTitle>
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
        {project.description && (
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{project.description}</p>
        )}
        <div className="flex items-center gap-3">
          <Badge className={STATUS_COLORS[project.status] ?? ""} variant="secondary">
            {project.status.replace("_", " ")}
          </Badge>
          {project.area && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {project.area.color && (
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: project.area.color }} />
              )}
              {project.area.name}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckSquare className="h-3.5 w-3.5" />
            {project._count.tasks} tasks
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
