import { configDotenv } from "dotenv";
import { Sequelize } from "sequelize";

configDotenv();

export const sequelize = new Sequelize(
  process.env.DATABASE as any,
  process.env.DB_USER as any,
  process.env.DB_PASSWORD as any,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log(
      `Connection has been established successfully with DB ${process.env.DATABASE} `
    );
  })
  .catch((error) => {
    console.error("Unable to connect to the database: ", error);
  });
