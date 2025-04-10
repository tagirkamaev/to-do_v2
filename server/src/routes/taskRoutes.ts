import express from "express";
import { getTasks, createTask, updateTask, deleteTask } from "../controllers/taskController";
import { validateTask, validateTaskId, validateRequest } from "../middleware/taskValidation";

const taskRoutes = express.Router();

taskRoutes.get("/", getTasks);
// taskRoutes.post("/", createTask);
taskRoutes.post("/", validateTask, validateRequest, createTask);
// taskRoutes.put("/:id", updateTask);
taskRoutes.put("/:id", validateTaskId, validateTask, validateRequest, updateTask);
// taskRoutes.delete("/:id", deleteTask);
taskRoutes.delete("/:id", validateTaskId, validateRequest, deleteTask);

export default taskRoutes;
