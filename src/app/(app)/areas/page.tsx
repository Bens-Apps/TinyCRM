import { requireAuth } from "@/lib/auth-helpers";
import { getAreas } from "@/queries/areas";
import { AreaList } from "@/components/areas/area-list";

export default async function AreasPage() {
  const user = await requireAuth();
  const areas = await getAreas(user.id!);

  return (
    <div className="p-6">
      <AreaList areas={areas} />
    </div>
  );
}
