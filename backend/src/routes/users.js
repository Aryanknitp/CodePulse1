import { Router } from "express";
import * as c from "../controllers/user.js";
import { requireAuth } from "../middleware/auth.js";
const r = Router();
r.use(requireAuth);
r.get("/me", c.getMe);
r.patch("/me", c.updateMe);
r.delete("/me", c.deleteMe);
export default r;
