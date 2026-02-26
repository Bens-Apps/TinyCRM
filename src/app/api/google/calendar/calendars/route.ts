import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listUserCalendars } from "@/lib/google-calendar";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const calendars = await listUserCalendars(session.user.id);
  return NextResponse.json(calendars);
}
