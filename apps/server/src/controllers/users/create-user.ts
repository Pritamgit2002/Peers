import { uuidv4, z } from "zod";
import type { Request, Response } from "express";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, clerkUserId, imageUrl, isActive } =
      z_create_user_body.parse(req.body);

    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        clerkUserId,
        imageUrl: imageUrl || "",
        isActive,
      })
      .returning();

    if (!user) {
      return res.status(400).json({ error: "Failed to create user" });
    }

    return res.status(201).json({ user });
  } catch (error) {
    console.error("createUser failed:", error);

    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid request", details: error.flatten() });
    }

    return res.status(500).json({ error: "Something went wrong" });
  }
};

const z_create_user_body = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  clerkUserId: z.string(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});
