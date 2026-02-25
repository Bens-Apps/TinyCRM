import { Suspense } from "react";
import { requireAuth } from "@/lib/auth-helpers";
import { getActivityLog } from "@/queries/activity";
import { ActivityFeed } from "@/components/activity/activity-feed";

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireAuth();
  const params = await searchParams;

  const logs = await getActivityLog(user.id!, {
    entityType: params.entityType,
  });

  return (
    <div className="p-6">
      <Suspense>
        <ActivityFeed logs={logs} />
      </Suspense>
    </div>
  );
}
