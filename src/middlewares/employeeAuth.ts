import { NextFunction, Request, Response } from "express";
import { Employees } from "../models/EmployeeModel";
import { Op } from "sequelize";
import { validation } from "./joi";

export const signupValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  let { email, username, password, phone, country, address }: any = req.body;
  const payload = {
    username,
    email,
  };
  try {
    console.log("check validation");
    const emailInUse = await Employees.findOne({
      where: { email },
    });
    const usernameInUse = await Employees.findOne({
      where: { username },
    });

    if (emailInUse && usernameInUse) {
      return res.status(400).json("Email/Username already in use ");
    }
    const { error, value } = validation.validate(payload);
    next();
  } catch (error) {
    console.log("error---------", error);
  }
};

export const loginValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { login }: any = req.body;
  try {
    const user = await Employees.findOne({
      where: {
        [Op.or]: [{ username: login }, { email: login }],
      },
    });
    if (!user) {
      return res.status(400).json("Email/Username doesn't exist ");
    }

    next();
  } catch (error) {
    console.log("error", error);
  }
};
