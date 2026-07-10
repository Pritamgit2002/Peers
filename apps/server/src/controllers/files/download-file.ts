import type { Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/index.js";
import { messages } from "../../db/schema.js";
import { assertR2ObjectExists, getR2DownloadUrl } from "../../lib/r2.js";

function getFilenameFromMessage(content: string, attachmentKey: string) {
  const trimmedContent = content.trim();

  if (trimmedContent) {
    return trimmedContent;
  }

  const keySegment = attachmentKey.split("/").pop()?.trim();
  return keySegment || "download";
}

export const downloadFile = async (req: Request, res: Response) => {
  try {
    const { message_id, conversation_id } = z_download_file_query.parse(
      req.query,
    );

    const [message] = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.id, message_id),
          eq(messages.conversationId, conversation_id),
        ),
      )
      .limit(1);

    if (!message?.attachmentKey.trim()) {
      return res.status(404).json({ error: "File not found" });
    }

    const filename = getFilenameFromMessage(
      message.content,
      message.attachmentKey,
    );

    try {
      await assertR2ObjectExists(message.attachmentKey);
    } catch {
      return res.status(404).json({ error: "File not found in storage" });
    }

    const download = await getR2DownloadUrl(message.attachmentKey, filename);

    return res.status(200).json(download);
  } catch (error) {
    console.error("[downloadFile] failed:", error);
    return res.status(400).json({ error: "Invalid request" });
  }
};

const z_download_file_query = z.object({
  message_id: z.coerce.number().int().positive(),
  conversation_id: z.coerce.number().int().positive(),
});
