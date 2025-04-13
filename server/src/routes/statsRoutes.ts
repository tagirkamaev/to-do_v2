import express from "express";
import {
  getUserStats,
  getProjectsStats,
  getTaskStatusDistribution,
} from "../controllers/statsController";
import { auth } from "../middleware/auth";

const statsRoutes = express.Router();

// Все маршруты статистики требуют аутентификации
statsRoutes.use(auth);

// Маршруты для статистики
statsRoutes.get("/user", getUserStats);
statsRoutes.get("/projects", getProjectsStats);
statsRoutes.get("/tasks/status", getTaskStatusDistribution);

export default statsRoutes;
