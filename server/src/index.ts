import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database";
import router from "./routes/taskRoutes";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/tasks", router);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Todo API is running" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
