import { Badge } from "@/components/ui/badge";

interface RelationshipBadgeProps {
  name: string;
  color?: string | null;
}

export function RelationshipBadge({ name, color }: RelationshipBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className="gap-1"
      style={color ? { backgroundColor: `${color}20`, color, borderColor: `${color}40` } : {}}
    >
      {name}
    </Badge>
  );
}
