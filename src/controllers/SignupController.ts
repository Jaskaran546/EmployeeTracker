import { NextFunction, Request, Response } from "express";
import { Employees } from "../models/EmployeeModel";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import {
  sendingMail,
  sendOtpNotification,
  sendVerificationMail,
} from "../mailer/mailing";
import { generateToken, validateToken } from "../jwt/jwt";
import { sequelize } from "../config/db.config";
import { randomInt } from "crypto";

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
        //if token is not created, send a status of 400
      } else {
        return res.status(400).send("token not created");
      }
    }
  } catch (error: any) {
    console.log("error", error);
    res.status(500).json({ message: "Error while signing up", error });
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { login, password } = req.body;

    console.log("login", login);

    const employee = await Employees.findOne({
      where: {
        [Op.or]: [{ username: login }, { email: login }],
      },
    });

    const passwordMatch = await bcrypt.compare(
      password,
      employee?.dataValues.password
    );

    if (!passwordMatch) {
      throw new Error("Wrong Credentials");
    }
    res.status(200).json({ message: "Login Successful" });
  } catch (error: any) {
    console.log("error", error);
    res.status(500).json({ message: "Erorr while logging in", error });
  }
};

export const verifyEmailLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token: any = req.query.token;

    const tokenPayload = validateToken(token);

    const employee = await Employees.findOne({
      where: {
        [Op.or]: [
          { username: (await tokenPayload).username },
          { email: (await tokenPayload).email },
        ],
      },
    });
    await employee?.update({ isVerified: true });
    console.log("employee", employee);
    if (employee) {
      res.status(200).json({
        message: "employee Verified",
        email: await employee.dataValues.email,
      });
    }
  } catch (error: any) {
    res.status(500).json({ message: "Error while Verifying Email", error });
  }
};

export const forgetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    const employee = await Employees.findOne({
      where: {
        [Op.or]: [{ email }],
      },
    });

    if (!employee) {
      res.status(400).json({ message: "Employee not Found" });
    }

    const otp = randomInt(1000, 999999);

    const otpExpiry = Date.now() + 5 * 60 * 1000; //5 min expiry
    await employee?.setDataValue("resetOtp", otp);
    await employee?.setDataValue("otpExpiry", otpExpiry);
    await employee?.save();
    await sendOtpNotification(email, employee);
    res.status(200).json({ message: "Otp Sent on Email" });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error while Forgetting Password", error });
  }
};

export const validateOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { email, otp, newPassword, confirmNewPassword } = req.body;
    const employee = await Employees.findOne({
      where: {
        email,
      },
    });

    if (!employee) {
      res.status(400).json({ message: "Employee not Found" });
    }

    if (Date.now() > employee?.dataValues.otpExpiry) {
      return res.status(400).json({ message: "OTP has expired", email: email });
    }

    // Check if OTP is correct
    if (employee?.dataValues.resetOtp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP", email: email });
    }

    // if (newPassword !== confirmNewPassword) {
    //   return res
    //     .status(400)
    //     .json({ message: "Passwords do not match", email: email });
    // }
    // await employee?.setDataValue("password", newPassword);

    //Reset OTP
    await employee?.setDataValue("otpExpiry", Date.now());
    await employee?.setDataValue("resetOtp", undefined);
    // await employee?.save();

    //Password Updation
    await changePassword(req, res, next);

    let newotp = await employee?.getDataValue("resetOtp");
    console.log("newotp", newotp);
    res.status(200).json({ message: "Password Updated Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error Resetting Password", error });
  }
};

export const getTotalemployees = async (res: Response) => {
  try {
    const employees = await Employees.findAll();
    res.status(200).json({ message: "Fetched all employees", employees });
  } catch (error: any) {
    console.log("error", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { login, newPassword, confirmNewPassword } = req.body;
    const employee = await Employees.findOne({
      where: {
        [Op.or]: [{ username: login }, { email: login }],
      },
    });
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Passwords do not match", login });
    }

    //Password Updation
    await employee?.setDataValue("password", newPassword);
    await employee?.save();
  } catch (error: any) {
    console.log("error", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// export const updateEmployeeProfile = async (res: Response) => {
//   try {
//     const employee = await Employees.findOne({
//       where: {
//         email,
//       },
//     });
//     res.status(200).json({ message: "Fetched all employees", employees });
//   } catch (error: any) {
//     console.log("error", error);
//     res.status(500).json({ message: "Internal server error", error });
//   }
// };
