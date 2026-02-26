import { requireAuth } from "@/lib/auth-helpers";
import { getOverdueTasks, getTodayTasks, getUpcomingTasks } from "@/queries/tasks";
import { prisma } from "@/lib/prisma";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const user = await requireAuth();

  const [overdue, today, upcoming, recentJournal] = await Promise.all([
    getOverdueTasks(user.id!),
    getTodayTasks(user.id!),
    getUpcomingTasks(user.id!),
    prisma.journalEntry.findMany({
      where: { userId: user.id! },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
  ]);

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Dashboard</h1>
      <DashboardView
        overdueTasks={overdue}
        todayTasks={today}
        upcomingTasks={upcoming}
        recentJournal={recentJournal}
      />
    </div>
  );
}
