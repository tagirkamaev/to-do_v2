import express from "express";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  addTaskToProject,
  removeTaskFromProject,
} from "../controllers/projectController";
import {
  validateProject,
  validateProjectId,
  validateTaskId,
  validateRequest,
} from "../middleware/projectValidation";

const projectRoutes = express.Router();

projectRoutes.get("/", getProjects);

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

export default projectRoutes;
