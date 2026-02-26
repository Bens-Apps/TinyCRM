import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getMessage } from "@/lib/google-gmail";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messageId } = await params;
  const message = await getMessage(session.user.id, messageId);

  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  return NextResponse.json(message);
}
