import type {
  GmailMessageHeader,
  GmailMessagePayload,
  GmailMessagePart,
  GmailAttachment,
} from "@/types/gmail";

export function decodeBase64Url(data: string): string {
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf-8");
}

export function getHeader(
  headers: GmailMessageHeader[],
  name: string
): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

export function extractBody(
  payload: GmailMessagePayload,
  mimeType: "text/html" | "text/plain"
): string {
  // Direct body on payload
  if (payload.mimeType === mimeType && payload.body.data) {
    return decodeBase64Url(payload.body.data);
  }

  // Recursively search parts
  if (payload.parts) {
    const result = findPartBody(payload.parts, mimeType);
    if (result) return result;
  }

  return "";
}

function findPartBody(
  parts: GmailMessagePart[],
  mimeType: string
): string | null {
  for (const part of parts) {
    if (part.mimeType === mimeType && part.body.data) {
      return decodeBase64Url(part.body.data);
    }
    if (part.parts) {
      const result = findPartBody(part.parts, mimeType);
      if (result) return result;
    }
  }
  return null;
}

export function extractAttachments(
  payload: GmailMessagePayload,
  messageId: string
): GmailAttachment[] {
  const attachments: GmailAttachment[] = [];
  collectAttachments(payload.parts ?? [], messageId, attachments);
  return attachments;
}

function collectAttachments(
  parts: GmailMessagePart[],
  messageId: string,
  result: GmailAttachment[]
) {
  for (const part of parts) {
    if (part.filename && part.body.attachmentId) {
      result.push({
        filename: part.filename,
        mimeType: part.mimeType,
        size: part.body.size,
        attachmentId: part.body.attachmentId,
        messageId,
      });
    }
    if (part.parts) {
      collectAttachments(part.parts, messageId, result);
    }
  }
}

export function parseEmailAddress(raw: string): { name: string; email: string } {
  const match = raw.match(/^(.+?)\s*<(.+?)>$/);
  if (match) {
    return { name: match[1].replace(/"/g, "").trim(), email: match[2] };
  }
  return { name: raw, email: raw };
}
