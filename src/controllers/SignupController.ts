import { NextFunction, Request, Response } from "express";
import { Employees } from "../models/EmployeeModel";
import bcrypt from "bcrypt";
import { error } from "console";
import { Op } from "sequelize";
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { sendingMail } from "../mailer/mailing";
import { generateToken } from "../jwt/jwt";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    let { email, username, password, phone, country, address, isVerified } =
      req.body;
    console.log("req.body", req.body);

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
    console.log("employee.dataValues", employee.dataValues);

    if (employee) {
      let token = await generateToken(data);

      //if token is created, send the user a mail
      if (token) {

      //send email to the user
      //with the function coming from the mailing.js file
      //message containing the user id and the token to help verify their email
      sendingMail({
        from: "jaskaran.singh@antiersolutions.com",
        to: `${email}`,
        subject: "Account Verification Link",
        text: `Hello, ${employee.dataValues.username} Please verify your email by
              clicking this link :
              http://localhost:8080/api/users/verify-email/ `,
      });

      return res.status(201).send(employee);
      //if token is not created, send a status of 400
      } else {
        return res.status(400).send("Token not created");
      }
    }
  } catch (error: any) {
    res.send({ message: error.message });
  }
  res.send;
  console.log("error", error);
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
