import { z } from "zod";
import type { Request, Response } from "express";
import { db } from "../../db/index.js";
import { messages } from "../../db/schema.js";
import { broadcastMessageCreated } from "../../websocket/broadcaster.js";
import { serializeMessage } from "../../lib/serialize-message.js";
import { getAuth } from "@clerk/express";

export const postMessage = async (req: Request, res: Response) => {
  try {
    const { conversation_id } = z_post_message_query.parse(req.query);
    const { sender_id, content, attachment_key, attachment_type } =
      z_post_message_body.parse(req.body);

    const user = await getAuth(req);
    console.log(user.userId, "user");

    console.log(
      "postMessage",
      conversation_id,
      sender_id,
      content,
      attachment_key,
      attachment_type,
    );

    const [message] = await db
      .insert(messages)
      .values({
        conversationId: conversation_id,
        senderId: sender_id,
        content,
        attachmentKey: attachment_key || "",
        attachmentType: attachment_type || "",
      })
      .returning();

    if (!message) {
      return res.status(500).json({ error: "Failed to create message" });
    }

    broadcastMessageCreated(message);

    return res.status(201).json({ message: serializeMessage(message) });
  } catch (error) {
    console.error("postMessage failed:", error);
    return res.status(400).json({ error: "Invalid request" });
  }
};

const z_post_message_query = z.object({
  conversation_id: z.coerce.number(),
});

const z_post_message_body = z.object({
  sender_id: z.number(),
  content: z.string().optional().default(""),
  attachment_key: z.string().optional().default(""),
  attachment_type: z.string().optional().default(""),
});
