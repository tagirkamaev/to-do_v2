import express from "express";
import { getTasks, createTask, updateTask, deleteTask } from "../controllers/taskController";
import { validateTask, validateTaskId, validateRequest } from "../middleware/taskValidation";

const router = express.Router();

router.get("/", getTasks);
// router.post("/", createTask);
router.post("/", validateTask, validateRequest, createTask);
// router.put("/:id", updateTask);
router.put("/:id", validateTaskId, validateTask, validateRequest, updateTask);
// router.delete("/:id", deleteTask);
router.delete("/:id", validateTaskId, validateRequest, deleteTask);

export default router;
