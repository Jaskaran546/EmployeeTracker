import { NextFunction, Request, Response } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { Employees } from "../models/EmployeeModel";

export interface SignupTokenPayload {
  email: string;
  username: string;
  country: string;
  phone: number;
}

export interface LoginTokenPayload {
  email: string;
  username: string;
}

export async function generateToken(data: any): Promise<any> {
  let secretKey: Secret = String(process.env.JWT_SECRETKEY);
  let payload: SignupTokenPayload = {
    email: data.email,
    username: data.username,
    country: data.country,
    phone: data.phone,
  };
  let expiredTime: any = process.env.JWT_EXPIRES_IN;
  let option: SignOptions = {
    expiresIn: expiredTime,
  };
  return jwt.sign(payload, secretKey, option);
}

export async function generateLoginToken(data: any): Promise<any> {
  let secretKey: Secret = String(process.env.JWT_SECRETKEY);
  let payload: LoginTokenPayload = {
    email: data.email,
    username: data.username,
  };
  let expiredTime: any = process.env.JWT_EXPIRES_IN;
  let option: SignOptions = {
    expiresIn: expiredTime,
  };
  return jwt.sign(payload, secretKey, option);
}

export const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // let { email, token } = req.body;

    // const user = await Employees.findOne({
    //   where: {
    //     email,
    //   },
    // });
    // if (!user) {
    //   return res.status(400).json("Email doesn't exist ");
    // }
    const token: any = req.query.token || req.body.token;

    let secretKey: Secret = String(process.env.JWT_SECRETKEY);
    console.log("heree", token);

    let tokenPayload = jwt.verify(token, secretKey);

    req.body.tokenPayload = tokenPayload;
    next();
  } catch (error) {
    throw error;

  }
};
