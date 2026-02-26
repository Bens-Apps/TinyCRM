import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/auth";
import { getGoogleOAuth2Client } from "@/lib/google-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string; attachmentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messageId, attachmentId } = await params;
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("filename") ?? "attachment";
  const mimeType = searchParams.get("mimeType") ?? "application/octet-stream";

  const oauth2Client = await getGoogleOAuth2Client(session.user.id);
  if (!oauth2Client) {
    return NextResponse.json({ error: "Not connected" }, { status: 403 });
  }

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    const response = await gmail.users.messages.attachments.get({
      userId: "me",
      messageId,
      id: attachmentId,
    });

    const data = response.data.data;
    if (!data) {
      return NextResponse.json({ error: "No attachment data" }, { status: 404 });
    }

    // Convert base64url to buffer
    const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
    const buffer = Buffer.from(base64, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error) {
    console.error("Attachment download error:", error);
    return NextResponse.json({ error: "Failed to download attachment" }, { status: 500 });
  }
}
