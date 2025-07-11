import { NextFunction, Request, Response } from "express";
import { Employees } from "../models/EmployeeModel";
import bcrypt from "bcrypt";
import { error } from "console";
import { Op } from "sequelize";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { email, username, password, phone, country, address } = req.body;
    const emailInUse = await Employees.findOne({
      where: { email },
    });
    const usernameInUse = await Employees.findOne({
      where: { username },
    });

    if (emailInUse && usernameInUse) {
      throw new Error("Email/Username already in use ");
    }
    // const hash = bcrypt.hashSync(password, 12);
    // password = hash;

    await Employees.create({
      email,
      username,
      password,
      phone,
      country,
      address,
    }).catch((error: any) => {
      throw new Error(error);
    });
    res.send({ message: "Success" });
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

    console.log("user", user);
    console.log("user?.dataValues.password", user?.dataValues.password);

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
