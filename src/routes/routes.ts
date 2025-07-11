import { Router } from "express";
import { getTotalUsers, login, signup } from "../controllers/SignupController";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/", getTotalUsers);

export default router;
