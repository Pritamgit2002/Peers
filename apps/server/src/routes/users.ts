import { type IRouter, Router } from "express";
import { createUser } from "../controllers/users/create-user.js";
import { getUser } from "../controllers/users/get-user.js";
import { activeUser } from "../controllers/users/active-user.js";

const router: IRouter = Router();
router.post("/", createUser);
router.get("/:clerkUserId", getUser);
router.put("/:clerkUserId/active", activeUser);

export { router as usersRoutes };
