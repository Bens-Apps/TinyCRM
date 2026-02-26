import { google } from "googleapis";
import { getGoogleOAuth2Client } from "@/lib/google-auth";
import { getHeader, extractBody, extractAttachments } from "@/lib/gmail-parser";
import type {
  GmailMessage,
  GmailMessageFull,
  GmailMessagePayload,
  GmailListResponse,
  GmailThread,
} from "@/types/gmail";
import type { SendEmailInput } from "@/lib/validations/gmail";

async function getGmailClient(userId: string) {
  const oauth2Client = await getGoogleOAuth2Client(userId);
  if (!oauth2Client) return null;
  return google.gmail({ version: "v1", auth: oauth2Client });
}

function parseMessageToSummary(msg: {
  id?: string | null;
  threadId?: string | null;
  snippet?: string | null;
  labelIds?: string[] | null;
  internalDate?: string | null;
  payload?: GmailMessagePayload | null;
}): GmailMessage {
  const headers = msg.payload?.headers ?? [];
  return {
    id: msg.id ?? "",
    threadId: msg.threadId ?? "",
    snippet: msg.snippet ?? "",
    labelIds: msg.labelIds ?? [],
    internalDate: msg.internalDate ?? "",
    from: getHeader(headers, "From"),
    to: getHeader(headers, "To"),
    subject: getHeader(headers, "Subject"),
    date: getHeader(headers, "Date"),
    isUnread: (msg.labelIds ?? []).includes("UNREAD"),
  };
}

function parseMessageToFull(msg: {
  id?: string | null;
  threadId?: string | null;
  snippet?: string | null;
  labelIds?: string[] | null;
  internalDate?: string | null;
  payload?: GmailMessagePayload | null;
}): GmailMessageFull {
  const summary = parseMessageToSummary(msg);
  const payload = msg.payload as GmailMessagePayload;
  const headers = payload?.headers ?? [];

  return {
    ...summary,
    htmlBody: payload ? extractBody(payload, "text/html") : "",
    textBody: payload ? extractBody(payload, "text/plain") : "",
    cc: getHeader(headers, "Cc"),
    bcc: getHeader(headers, "Bcc"),
    messageId: getHeader(headers, "Message-ID"),
    inReplyTo: getHeader(headers, "In-Reply-To"),
    attachments: payload ? extractAttachments(payload, msg.id ?? "") : [],
  };
}

export async function listMessages(
  userId: string,
  options: { query?: string; pageToken?: string; maxResults?: number } = {}
): Promise<GmailListResponse> {
  const gmail = await getGmailClient(userId);
  if (!gmail) return { messages: [], resultSizeEstimate: 0 };

  try {
    const response = await gmail.users.messages.list({
      userId: "me",
      q: options.query || "in:inbox",
      pageToken: options.pageToken,
      maxResults: options.maxResults ?? 20,
    });

    if (!response.data.messages?.length) {
      return { messages: [], resultSizeEstimate: response.data.resultSizeEstimate ?? 0 };
    }

    // Fetch message details in parallel (metadata only for list view)
    const messages = await Promise.all(
      response.data.messages.map(async (m) => {
        const detail = await gmail.users.messages.get({
          userId: "me",
          id: m.id!,
          format: "metadata",
          metadataHeaders: ["From", "To", "Subject", "Date"],
        });
        return parseMessageToSummary(detail.data as Parameters<typeof parseMessageToSummary>[0]);
      })
    );

    return {
      messages,
      nextPageToken: response.data.nextPageToken ?? undefined,
      resultSizeEstimate: response.data.resultSizeEstimate ?? 0,
    };
  } catch (error) {
    console.error("Gmail listMessages error:", error);
    return { messages: [], resultSizeEstimate: 0 };
  }
}

export async function getMessage(
  userId: string,
  messageId: string
): Promise<GmailMessageFull | null> {
  const gmail = await getGmailClient(userId);
  if (!gmail) return null;

  try {
    const response = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });
    return parseMessageToFull(response.data as Parameters<typeof parseMessageToFull>[0]);
  } catch (error) {
    console.error("Gmail getMessage error:", error);
    return null;
  }
}

export async function getThread(
  userId: string,
  threadId: string
): Promise<GmailThread | null> {
  const gmail = await getGmailClient(userId);
  if (!gmail) return null;

  try {
    const response = await gmail.users.threads.get({
      userId: "me",
      id: threadId,
      format: "full",
    });

    const messages = (response.data.messages ?? []).map((m) =>
      parseMessageToFull(m as Parameters<typeof parseMessageToFull>[0])
    );

    return {
      id: response.data.id ?? threadId,
      messages,
      subject: messages[0]?.subject ?? "(no subject)",
    };
  } catch (error) {
    console.error("Gmail getThread error:", error);
    return null;
  }
}

export async function sendEmail(
  userId: string,
  input: SendEmailInput
): Promise<{ id: string } | null> {
  const gmail = await getGmailClient(userId);
  if (!gmail) return null;

  const headers = [
    `To: ${input.to}`,
    `Subject: ${input.subject}`,
    `Content-Type: text/html; charset=utf-8`,
  ];

  if (input.inReplyTo) {
    headers.push(`In-Reply-To: ${input.inReplyTo}`);
  }
  if (input.references) {
    headers.push(`References: ${input.references}`);
  }

  const email = [...headers, "", input.body].join("\r\n");
  const encodedMessage = Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  try {
    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
        threadId: input.threadId,
      },
    });

    return { id: response.data.id ?? "" };
  } catch (error) {
    console.error("Gmail sendEmail error:", error);
    return null;
  }
}

