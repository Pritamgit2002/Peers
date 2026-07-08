import { type IRouter, Router } from "express";
import { createTusServer } from "../controllers/files/upload-files.js";

const tusServer = createTusServer();

const router: IRouter = Router();
router.all("/{*path}", tusServer.handle.bind(tusServer));

export { router as filesRoutes };
