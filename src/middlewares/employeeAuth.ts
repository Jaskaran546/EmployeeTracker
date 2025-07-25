import { NextFunction, Request, Response } from "express";
import { Employees } from "../models/EmployeeModel";
import { Op } from "sequelize";
import { signupJOIValidation } from "./joi";
import { STATUS_CODES } from "http";
import { RESPONSES } from "../utils/StatusCode";

export const signupValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  let { email, username }: any = req.body;

  const payload = {
    username,
    email,
  };
  const { error, value } = signupJOIValidation.validate(payload);
  
  console.log("error", error);
  console.log("value", value);
  if (error) {
    return res.status(RESPONSES.BADREQUEST).json(error.message);
  }
  try {
    const existingUser = await Employees.findOne({
      where: {
        [Op.or]: [{ username: username }, { email: email }],
      },
    });

    if (existingUser) {
      return res.status(400).json("Email/Username already in use ");
    }

    next();
  } catch (error) {
    console.log("error---------", error);
  }
};

export const loginValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  let { login }: any = req.body;
  try {
    const user = await Employees.findOne({
      where: {
        [Op.or]: [{ username: login }, { email: login }],
      },
    });

    if (!user) {
      return res
        .status(RESPONSES.BADREQUEST)
        .json("Email/Username doesn't exist ");
    }
    req.body.user = user;
    next();
  } catch (error) {
    console.log("error", error);
  }
};

export const existingUserCommonValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    let { email, token } = req.body;

    const user = await Employees.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(RESPONSES.BADREQUEST).json("Email doesn't exist ");
    }
    req.body.user = user;
    next();
  } catch (error) {
    console.log("error", error);
  }
};
