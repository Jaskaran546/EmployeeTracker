import app from "./app";
import config from "./config/config";
import { sequelize } from "./config/db.config";

const init = async () => {
  sequelize.sync();
  console.log("All models were synchronized successfully.");

  app.listen(config.port, async () => {
    console.log(`Server running on port ${config.port}`);
    console.log("process.env.DB_HOST", process.env.DB_HOST);
  });
};
init();
