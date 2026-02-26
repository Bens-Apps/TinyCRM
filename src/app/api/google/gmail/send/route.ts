import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/google-gmail";
import { sendEmailSchema } from "@/lib/validations/gmail";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = sendEmailSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = await sendEmail(session.user.id, parsed.data);

  if (!result) {
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}
