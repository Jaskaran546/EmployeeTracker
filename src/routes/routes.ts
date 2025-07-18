import { Router } from "express";

import { loginValidation, signupValidation } from "../middlewares/employeeAuth";
import { signup,login, getTotalUsers, verifyEmailLink } from "../controllers/SignupController";

const router = Router();

router.get("/verify-email",verifyEmailLink);
router.post("/signup", signupValidation,signup);
router.post("/login",loginValidation, login);
router.get("/", getTotalUsers);

export default router;
