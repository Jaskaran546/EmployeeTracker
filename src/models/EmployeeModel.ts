import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config";
import bcrypt from "bcrypt";
import { configDotenv } from "dotenv";

configDotenv();

export const Employees = sequelize.define(
  "employees",
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { max: 16, min: 4 },
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { max: 20, min: 8 },
    },
    phone: {
      type: DataTypes.INTEGER,
    },
    country: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
    resetOtp: {
      type: DataTypes.STRING,
      defaultValue: 0,
    },
    otpExpiry: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
    },
  },
  { timestamps: true,
    
   }
);

Employees.beforeCreate(async (user: any) => {
  const hash = bcrypt.hashSync(user.password, Number(process.env.SALT_ROUNDS));
  user.password = hash;
});

Employees.beforeUpdate(async (user: any) => {
  const hash = bcrypt.hashSync(user.password, Number(process.env.SALT_ROUNDS));
  user.password = hash;
});
