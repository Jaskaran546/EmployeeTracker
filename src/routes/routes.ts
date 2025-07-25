import { Router } from "express";

import {
  existingUserCommonValidation,
  loginValidation,
  signupValidation,
} from "../middlewares/employeeAuth";
import {
  signup,
  login,
  getTotalemployees,
  verifyEmailLink,
  forgetPassword,
  changePassword,
  updateEmployeeProfile,
  sendOTP,
  validateOTP,
  uploadProfilePic,
} from "../controllers/SignupController";
import { validateToken } from "../jwt/jwt";
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "../uploads");
//   },
//   filename: function (req, file, cb) {existingUserCommonValidation
//     cb(null, 'as');
//   },
// });

// const upload = multer({ storage: storage });

const router = Router();

router.get("/verify-email",validateToken, verifyEmailLink);
router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.post("/sendOTP", existingUserCommonValidation, sendOTP);
router.post("/validateOTP", existingUserCommonValidation, validateOTP);
router.post("/forgetPassword", existingUserCommonValidation, forgetPassword);
router.post("/changePassword", validateToken, changePassword);
router.post("/updateEmployeeProfile", validateToken, updateEmployeeProfile);
router.post("/uploadProfilePic", upload.single("profilepic"),validateToken, uploadProfilePic);
router.get("/", getTotalemployees);

export default router;
