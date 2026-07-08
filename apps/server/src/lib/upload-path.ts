import { randomBytes } from "node:crypto";
import { extname } from "node:path";

export function buildAttachmentKey(
  conversationId: string,
  filename: string | null | undefined,
) {
  const extension = filename ? extname(filename) : "";
  const id = randomBytes(16).toString("hex");

  return `chats/${conversationId}/${id}${extension}`;
}

export function encodeUploadIdForUrl(uploadId: string) {
  return Buffer.from(uploadId, "utf-8").toString("base64url");
}

export function decodeUploadIdFromUrl(encodedId: string) {
  return Buffer.from(encodedId, "base64url").toString("utf-8");
}
