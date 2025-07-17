import { Router } from "express";
import { getTotalUsers, login, signup } from "../controllers/SignupController";
import { signupValidation } from "../middlewares/employeeAuth";

const router = Router();

router.post("/signup",signupValidation, signup);
router.post("/login", login);
router.get("/", getTotalUsers);

export default router;
