import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export const getUser = async (req: Request, res: Response) => {
  try {
    const { clerkUserId } = z_get_user_params.parse(req.params);
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId));
    if (!user[0]) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({ user: user[0] });
  } catch (error) {
    console.error("getUser failed:", error);
    return res.status(400).json({ error: "Invalid request" });
  }
};

export const z_get_user_params = z.object({
  clerkUserId: z.string(),
});
