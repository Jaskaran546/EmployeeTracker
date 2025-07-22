import { Router } from "express";

import { loginValidation, signupValidation } from "../middlewares/employeeAuth";
import { signup,login, getTotalemployees, verifyEmailLink, forgetPassword, validateOTP } from "../controllers/SignupController";

const router = Router();

router.get("/verify-email",verifyEmailLink);
router.post("/signup", signupValidation,signup);
router.post("/login",loginValidation, login);
router.post("/forgetPassword",forgetPassword);
router.post("/validateOTP",validateOTP);
router.get("/", getTotalemployees);

export default router;
