import { Router } from "express";
import { progress } from "../controllers/progress.js";
import { requireAuth } from "../middleware/auth.js";
const r = Router();
r.use(requireAuth);
r.get("/", progress);
export default r;
