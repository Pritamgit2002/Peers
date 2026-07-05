import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { desc, eq } from "drizzle-orm";
import { messages } from "../db/schema.js";

export const getAllMessages = async (req: Request, res: Response) => {
  try {
    const { conversation_id } = z_get_all_messages_query.parse(req.query);

    // conversation_id =  94623452834;

    const allMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversation_id))
      .orderBy(desc(messages.createdAt));

    return res.status(200).json({ messages: allMessages });
  } catch (error) {
    return res.status(400).json({ error: "Invalid request" });
  }
};

const z_get_all_messages_query = z.object({
  conversation_id: z.coerce.number(),
});
