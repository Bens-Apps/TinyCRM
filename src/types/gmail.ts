export interface GmailMessageHeader {
  name: string;
  value: string;
}

export interface GmailAttachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
  messageId: string;
}

export interface GmailMessagePart {
  mimeType: string;
  filename?: string;
  body: { data?: string; size: number; attachmentId?: string };
  parts?: GmailMessagePart[];
  headers?: GmailMessageHeader[];
}

export interface GmailMessagePayload {
  mimeType: string;
  headers: GmailMessageHeader[];
  body: { data?: string; size: number };
  parts?: GmailMessagePart[];
}

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  labelIds: string[];
  internalDate: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  isUnread: boolean;
}

export interface GmailMessageFull extends GmailMessage {
  htmlBody: string;
  textBody: string;
  cc: string;
  bcc: string;
  messageId: string;
  inReplyTo: string;
  attachments: GmailAttachment[];
}

export interface GmailThread {
  id: string;
  messages: GmailMessageFull[];
  subject: string;
}

export interface GmailListResponse {
  messages: GmailMessage[];
  nextPageToken?: string;
  resultSizeEstimate: number;
}
