import { Router } from "express";
import * as c from "../controllers/problems.js";
import { requireAuth } from "../middleware/auth.js";
const r = Router();
r.use(requireAuth);
r.get("/", c.list);
r.get("/history", c.history);
r.get("/:id", c.getOne);
export default r;
