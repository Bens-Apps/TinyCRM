import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getTodayTasks } from "@/queries/tasks";
import { CalendarView } from "@/components/calendar/calendar-view";
import { CalendarSidebar } from "@/components/calendar/calendar-sidebar";

export default async function CalendarPage() {
  const user = await requireAuth();

  const [dbUser, todayTasks] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id! },
      select: { calendarConnected: true },
    }),
    getTodayTasks(user.id!),
  ]);

  const connected = dbUser?.calendarConnected ?? false;

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-auto p-6">
        <h1 className="mb-4 text-2xl font-bold tracking-tight">Calendar</h1>
        <CalendarView connected={connected} />
      </div>
      <CalendarSidebar tasks={todayTasks} />
    </div>
  );
}
