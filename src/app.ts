import express from "express";
import router from "./routes/routes";

const app = express();

app.use(express.json());

// Routes
app.use("/api", router);

// Global error handler (should be after routes)
// app.use(errorHandler);

export default app;
