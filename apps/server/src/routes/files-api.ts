import { type IRouter, Router } from "express";
import { downloadFile } from "../controllers/files/download-file.js";

const router: IRouter = Router();

router.get("/download", downloadFile);

export { router as filesApiRoutes };
