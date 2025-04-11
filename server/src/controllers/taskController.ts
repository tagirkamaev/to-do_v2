import { Request, Response } from "express";
import mongoose from "mongoose";
import Task from "../models/Task";
import Project from "../models/Project";

// Get all tasks for the current user
export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { projectId } = req.query;

    const query: any = { owner: userId };
    if (projectId) {
      query.project = projectId;
    }

    const tasks = await Task.find(query).populate("project", "title").sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error });
  }
};

// Create a new task
export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { projectId } = req.body;

    // Если указан projectId, проверяем существование проекта и владельца
    if (projectId) {
      const project = await Project.findOne({ _id: projectId, owner: userId });
      if (!project) {
        return res
          .status(404)
          .json({ message: "Project not found or you don't have access to it" });
      }
    }

    const task = await Task.create({
      ...req.body,
      owner: userId,
      project: projectId, // Явно устанавливаем project
    });

    console.log(`Created task:`, task);

    // Если задача создана с projectId, добавляем её в массив задач проекта
    if (projectId) {
      const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        { $addToSet: { tasks: new mongoose.Types.ObjectId(task._id) } },
        { new: true }
      );
      if (updatedProject) {
        console.log(`Added task ${task._id} to project ${projectId}`, updatedProject.tasks);
      } else {
        console.log(`Warning: Project ${projectId} not found after task creation`);
      }
    }

    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(400).json({ message: "Error creating task", error });
  }
};

// Update a task
export const updateTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { projectId } = req.body;
    const taskId = req.params.id;

    // Получаем текущую задачу
    const currentTask = await Task.findOne({ _id: taskId, owner: userId });
    if (!currentTask) {
      return res.status(404).json({ message: "Task not found or you don't have access to it" });
    }

    // Если указан projectId, проверяем существование проекта и владельца
    if (projectId) {
      const project = await Project.findOne({ _id: projectId, owner: userId });
      if (!project) {
        return res
          .status(404)
          .json({ message: "Project not found or you don't have access to it" });
      }
    }

    // Нормализуем ID проектов для сравнения
    const currentProjectId = currentTask.project ? currentTask.project.toString() : null;
    const newProjectId = projectId ? projectId.toString() : null;

    // Транзакционная логика для обеспечения согласованности данных
    if (currentProjectId !== newProjectId) {
      // Шаг 1: Удаляем задачу из старого проекта (если был)
      if (currentProjectId) {
        await Project.findByIdAndUpdate(currentProjectId, {
          $pull: { tasks: new mongoose.Types.ObjectId(taskId) },
        });
      }

      // Шаг 2: Добавляем задачу в новый проект (если есть)
      if (newProjectId) {
        const updatedProject = await Project.findByIdAndUpdate(
          newProjectId,
          { $addToSet: { tasks: new mongoose.Types.ObjectId(taskId) } },
          { new: true }
        );
      }
    }

    // Шаг 3: Обновляем саму задачу
    const task = await Task.findOneAndUpdate(
      { _id: taskId, owner: userId },
      { $set: req.body },
      { new: true }
    ).populate("project", "title");

    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ message: "Error updating task", error });
  }
};

// Delete a task
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const taskId = req.params.id;

    const task = await Task.findOne({ _id: taskId, owner: userId });
    if (!task) {
      return res.status(404).json({ message: "Task not found or you don't have access to it" });
    }

    // Удаляем задачу из проекта, если она была в нем
    if (task.project) {
      const projectId = task.project.toString();
      await Project.findByIdAndUpdate(projectId, {
        $pull: { tasks: new mongoose.Types.ObjectId(taskId) },
      });
      console.log(`Removed task ${taskId} from project ${projectId}`);
    }

    await Task.deleteOne({ _id: taskId, owner: userId });
    console.log(`Deleted task ${taskId}`);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(400).json({ message: "Error deleting task", error });
  }
};
