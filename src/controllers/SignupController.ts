import { NextFunction, Request, Response } from "express";
import { Employees } from "../models/EmployeeModel";
import bcrypt from "bcrypt";
import { error } from "console";
import { Op } from "sequelize";
import { sendingMail } from "../mailer/mailing";
import { generateToken, validateToken } from "../jwt/jwt";

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

      //if token is created, send the user a mail
      if (token) {
        sendingMail({
          from: "no-reply@employeeTracker.com",
          to: `${email}`,
          subject: "Account Verification Link",
          text: `Hello, ${employee.dataValues.username} Please verify your email by
              clicking this link :
              http://localhost:5000/api/verify-email/?token=${token}`,
        });

        return res.status(201).send(employee);
        //if token is not created, send a status of 400
      } else {
        return res.status(400).send("token not created");
      }
    }
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
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

    const user = await Employees.findOne({
      where: {
        [Op.or]: [{ username: login }, { email: login }],
      },
    });

    const passwordMatch = await bcrypt.compare(
      password,
      user?.dataValues.password
    );

    if (!passwordMatch) {
      throw new Error("Wrong Credentials");
    }
    res.status(200).json({ message: "Login Successful" });
  } catch (error: any) {
    console.log("error", error);
    res.status(500).json({ message: "Internal server error" });
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

    const user = await Employees.findOne({
      where: {
        [Op.or]: [
          { username: (await tokenPayload).username },
          { email: (await tokenPayload).email },
        ],
      },
    });
    await user?.update({ isVerified: true });
    console.log("user", user);
    if (user) {
      res
        .status(200)
        .json({ message: "User Verified", email: await user.dataValues.email });
    }
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTotalUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await Employees.findAll();
    res.status(200).json({ message: "Fetched all Users", users });
  } catch (error: any) {
    console.log("error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
