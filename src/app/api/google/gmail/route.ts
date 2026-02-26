import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { listMessages } from "@/lib/google-gmail";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || undefined;
  const pageToken = searchParams.get("pageToken") || undefined;
  const maxResults = parseInt(searchParams.get("maxResults") ?? "20", 10);

  const result = await listMessages(session.user.id, {
    query,
    pageToken,
    maxResults,
  });

  return NextResponse.json(result);
}
