import app from "./app";
import config from "./config/config";
import { sequelize } from "./config/db.config";
import { Employees } from "./models/EmployeeModel";

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

sequelize.sync()