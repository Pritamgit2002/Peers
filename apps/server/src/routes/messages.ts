import { IRouter, Router } from "express";
import { getAllMessages } from "../controllers/messages/get-all-messages.js";
import { postMessage } from "../controllers/messages/post-message.js";

const router: IRouter = Router();
router.get("/", getAllMessages);
router.post("/", postMessage);

export { router as messagesRoutes };
