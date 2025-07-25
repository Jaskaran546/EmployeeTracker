import { sendOtpNotification, sendVerificationMail } from "../mailer/mailing";
import { generateLoginToken, generateToken, validateToken } from "../jwt/jwt";
import { NextFunction, Request, Response } from "express";
import { Employees } from "../models/EmployeeModel";
import { RESPONSES } from "../utils/StatusCode";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { randomInt } from "crypto";
import {
  OTP_EXPIRY,
  OTP_HIGHER_RANGE,
  OTP_LOWER_RANGE,
} from "../utils/constant";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    let { email, username, password, phone, country, address, isVerified } =
      req.body;

    const data = {
      username,
      email,
      phone,
      country,
      address,
      password,
      isVerified,
    };

    const employee = await Employees.create(data);

    if (employee) {
      let token = await generateToken(data);

      //if token is created, send the employee a mail
      if (token) {
        await sendVerificationMail(employee, token);
        return res.status(201).send(employee);
        //if token is not created, send a status of RESPONSES.BADREQUEST
      } else {
        return res.status(RESPONSES.CREATED).send("token not created");
      }
    }
  } catch (error: any) {
    console.log("error", error);
    res
      .status(RESPONSES.BADREQUEST)
      .json({ message: "Error while signing up" });
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { password, user } = req.body;

    const employee = user;
    if (!employee?.dataValues.isVerified) {
      res.status(RESPONSES.BADREQUEST).json({ message: "User not Verified" });
    }

    let token = await generateLoginToken(employee);
    console.log("token", token);

    await employee?.update({ loginjwtToken: token });

    const passwordMatch = await bcrypt.compare(
      password,
      employee?.dataValues.password
    );

    if (!passwordMatch) {
      throw new Error("Wrong Credentials");
    }
    res.status(RESPONSES.SUCCESS).json({ message: "Login Successful", token });
  } catch (error: any) {
    console.log("error", error);
    res
      .status(RESPONSES.BADREQUEST)
      .json({ message: "Error while logging in" });
  }
};

export const verifyEmailLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token: any = req.query.token;
    console.log("token", token);

    const employee = await Employees.findOne({
      where: {
        [Op.or]: [
          { username: (await token).username },
          { email: (await token).email },
        ],
      },
    });
    await employee?.update({ isVerified: true });
    if (!employee) {
      res
        .status(RESPONSES.BADREQUEST)
        .json({ message: "Error while Verifying Email" });
    }

    res.status(RESPONSES.SUCCESS).json({
      message: "Employee Verified",
      email: await employee?.dataValues.email,
    });
  } catch (error: any) {
    res.status(RESPONSES.BADREQUEST).json({ message: "Error verifying email" });
  }
};

export const sendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, user } = req.body;

    const employee = user;
    if (!employee) {
      res.status(RESPONSES.BADREQUEST).json({ message: "Employee not Found" });
    }

    const otp = randomInt(Number(OTP_LOWER_RANGE), Number(OTP_HIGHER_RANGE));

    const otpExpiry = Date.now() + Number(OTP_EXPIRY) * 60 * 1000; //5 min expiry

    await employee?.setDataValue("resetOtp", otp);
    await employee?.setDataValue("otpExpiry", otpExpiry);
    await employee?.save();

    await sendOtpNotification(email, employee);
    res.status(RESPONSES.SUCCESS).json({ message: "Otp Sent on Email" });
  } catch (error) {
    console.log("error", error);
    res.status(RESPONSES.BADREQUEST).json({ message: "Error sending OTP" });
  }
};

export const validateOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    let { email, otp, user } = req.body;
    const employee = user;

    if (Date.now() > employee?.dataValues.otpExpiry) {
      return res
        .status(RESPONSES.BADREQUEST)
        .json({ message: "OTP has expired", email: email });
    }

    // Check if OTP is correct
    if (employee?.dataValues.resetOtp !== otp) {
      return res
        .status(RESPONSES.BADREQUEST)
        .json({ message: "Incorrect OTP", email: email });
    }

    //Reset OTP
    await employee?.setDataValue("otpExpiry", Date.now());
    await employee?.setDataValue("resetOtp", 0);
    await employee?.save();

    res
      .status(RESPONSES.SUCCESS)
      .json({ message: "Password Updated Successfully" });
  } catch (error) {
    console.log("error", error);
    res.status(RESPONSES.BADREQUEST).json({ message: "Error validating OTP" });
  }
};

export const forgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    let { email, newPassword, confirmNewPassword, user } = req.body;
    const employee = user;

    if (newPassword !== confirmNewPassword) {
      return res
        .status(RESPONSES.BADREQUEST)
        .json({ message: "Passwords do not match", email: email });
    }
    const hash = bcrypt.hashSync(
      user.password,
      Number(process.env.SALT_ROUNDS)
    );
    newPassword = hash;
    //Password Updation
    await employee?.setDataValue("password", newPassword);
    await employee?.save();
    res
      .status(RESPONSES.SUCCESS)
      .json({ message: "Password Updated Successfully" });
  } catch (error) {
    console.log("error", error);
    res
      .status(RESPONSES.BADREQUEST)
      .json({ message: "Error Resetting Password" });
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    let { email, oldPassword, newPassword, confirmNewPassword } = req.body;
    const employee = await Employees.findOne({
      where: {
        email,
      },
    });
    if (!employee) {
      return res.status(400).json("Email doesn't exist ");
    }

    if (!employee?.dataValues.isVerified) {
      res
        .status(RESPONSES.BADREQUEST)
        .json({ message: "Employee not Verified" });
    }
    const passwordMatch = await bcrypt.compare(
      oldPassword,
      employee?.dataValues.password
    );

    if (oldPassword !== passwordMatch) {
      return res
        .status(RESPONSES.BADREQUEST)
        .json({ message: "Invalid Password" });
    }
    if (newPassword !== confirmNewPassword) {
      return res
        .status(RESPONSES.BADREQUEST)
        .json({ message: "Passwords do not match", email });
    }
    const hash = bcrypt.hashSync(
      employee?.dataValues.password,
      Number(process.env.SALT_ROUNDS)
    );

    newPassword = hash;
    //Password Updation
    await employee?.setDataValue("password", newPassword);
    await employee?.save();
    res
      .status(RESPONSES.SUCCESS)
      .json({ message: "Password Updated Successfully" });
  } catch (error: any) {
    console.log("error", error);
    res
      .status(RESPONSES.BADREQUEST)
      .json({ message: "Error changing password" });
  }
};

export const updateEmployeeProfile = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email, username, phone, country, address, user } = req.body;

    const employee = await Employees.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(400).json("Email doesn't exist ");
    }

    if (!employee?.dataValues.isVerified) {
      res.status(RESPONSES.BADREQUEST).json({ message: "User not Verified" });
    }

    /// Username Check
    const existingUsername = await Employees.findAll({
      where: {
        username,
      },
      attributes: {
        exclude: ["password", "resetOtp", "otpExpiry"],
      },
    });

    if (!existingUsername) {
      res.status(RESPONSES.BADREQUEST).json({ message: "Username Exists" });
    }

    await employee?.update({ username, phone, country, address });

    res
      .status(RESPONSES.SUCCESS)
      .json({ message: "Updated Employee Profile", employee });
  } catch (error: any) {
    console.log("error", error);
    res
      .status(RESPONSES.BADREQUEST)
      .json({ message: "Error updating Profile" });
  }
};

export const getTotalemployees = async (req: Request, res: Response) => {
  try {
    const employees = await Employees.findAll({
      attributes: {
        exclude: ["password", "resetOtp", "otpExpiry"],
      },
    });
    console.log("employees", employees);
    res
      .status(RESPONSES.SUCCESS)
      .json({ message: " Total Employees", employees });
  } catch (error: any) {
    console.log("error", error);
    res
      .status(RESPONSES.BADREQUEST)
      .json({ message: "Error getting Total Employees" });
  }
};

export const uploadProfilePic = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    let { email } = req.body;
    const employee = await Employees.findOne({
      where: {
        email,
      },
    });
    if (!employee) {
      return res.status(400).json("Email doesn't exist ");
    }
    if (!employee?.dataValues.isVerified) {
      res.status(RESPONSES.BADREQUEST).json({ message: "User not Verified" });
    }

    await employee?.update({
      profilePic: req.file?.buffer,
    });

    res.status(RESPONSES.SUCCESS).json({ message: "Uploaded Successfully" });
  } catch (error) {
    console.log("error", error);
    res
      .status(RESPONSES.BADREQUEST)
      .json({ message: "Error uploading profile pic" });
  }
};
