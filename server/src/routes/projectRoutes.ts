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

const projectRouter = express.Router();

projectRouter.get("/", getProjects);

projectRouter.post("/", validateProject, validateRequest, createProject);

projectRouter.put("/:id", validateProjectId, validateProject, validateRequest, updateProject);

projectRouter.delete("/:id", validateProjectId, validateRequest, deleteProject);

// Routes for adding and deleting tasks
projectRouter.post(
  "/:projectId/tasks/:taskId",
  validateProjectId,
  validateTaskId,
  validateRequest,
  addTaskToProject
);
projectRouter.delete(
  "/:projectId/tasks/:taskId",
  validateProjectId,
  validateTaskId,
  validateRequest,
  removeTaskFromProject
);

export default projectRouter;
