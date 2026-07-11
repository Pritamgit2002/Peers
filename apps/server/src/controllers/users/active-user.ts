import type { Request, Response } from "express";
import { z } from "zod";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export const activeUser = async (req: Request, res: Response) => {
  try {
    const { clerkUserId } = z_active_user_params.parse(req.params);
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId));

    if (user[0]?.isActive) {
      await db
        .update(users)
        .set({ isActive: false })
        .where(eq(users.clerkUserId, clerkUserId));
      return res.status(200).json({ message: "User deactivated" });
    } else {
      await db
        .update(users)
        .set({ isActive: true })
        .where(eq(users.clerkUserId, clerkUserId));
      return res.status(200).json({ message: "User activated" });
    }
  } catch (error) {
    console.error("activeUser failed:", error);
    return res.status(400).json({ error: "Invalid request" });
  }
};

export const z_active_user_params = z.object({
  clerkUserId: z.string(),
});
