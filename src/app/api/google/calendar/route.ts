import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCalendarEvents } from "@/lib/google-calendar";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const timeMin = searchParams.get("timeMin");
  const timeMax = searchParams.get("timeMax");

  if (!timeMin || !timeMax) {
    return NextResponse.json({ error: "timeMin and timeMax required" }, { status: 400 });
  }

  const events = await getCalendarEvents(session.user.id, timeMin, timeMax);
  return NextResponse.json(events);
}
