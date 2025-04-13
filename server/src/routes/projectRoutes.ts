import express from "express";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  addTaskToProject,
  removeTaskFromProject,
  getProjectTasks,
  searchProjects,
} from "../controllers/projectController";
import {
  validateProject,
  validateProjectId,
  validateTaskId,
  validateRequest,
} from "../middleware/projectValidation";
import { auth } from "../middleware/auth";

const projectRoutes = express.Router();

projectRoutes.use(auth);

projectRoutes.get("/", getProjects);
projectRoutes.get("/search", searchProjects);

projectRoutes.post("/", validateProject, validateRequest, createProject);

projectRoutes.put("/:id", validateProjectId, validateProject, validateRequest, updateProject);

projectRoutes.delete("/:id", validateProjectId, validateRequest, deleteProject);

// Routes for adding and deleting tasks
projectRoutes.post(
  "/:projectId/tasks/:taskId",
  validateProjectId,
  validateTaskId,
  validateRequest,
  addTaskToProject
);
projectRoutes.delete(
  "/:projectId/tasks/:taskId",
  validateProjectId,
  validateTaskId,
  validateRequest,
  removeTaskFromProject
);

// Маршрут для получения задач проекта
projectRoutes.get("/:id/tasks", validateProjectId, validateRequest, getProjectTasks);

export default projectRoutes;
