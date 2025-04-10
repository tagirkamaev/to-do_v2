import { Request, Response } from "express";
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

    // Если задача создана с projectId, добавляем её в массив задач проекта
    if (projectId) {
      await Project.findByIdAndUpdate(projectId, { $addToSet: { tasks: task._id } }, { new: true });
    }

    res.status(201).json(task);
  } catch (error) {
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

    // Обновляем связи между задачей и проектами
    if (currentProjectId !== newProjectId) {
      // Если задача была standalone и теперь привязана к проекту
      if (!currentProjectId && newProjectId) {
        await Project.findByIdAndUpdate(newProjectId, { $addToSet: { tasks: taskId } });
      }
      // Если задача была в проекте и теперь становится standalone
      else if (currentProjectId && !newProjectId) {
        await Project.findByIdAndUpdate(currentProjectId, { $pull: { tasks: taskId } });
      }
      // Если задача перемещается между проектами
      else if (currentProjectId && newProjectId) {
        await Project.findByIdAndUpdate(currentProjectId, { $pull: { tasks: taskId } });
        await Project.findByIdAndUpdate(newProjectId, { $addToSet: { tasks: taskId } });
      }
    }

    // Обновляем саму задачу
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
      await Project.findByIdAndUpdate(task.project, { $pull: { tasks: taskId } });
    }

    await Task.deleteOne({ _id: taskId, owner: userId });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting task", error });
  }
};
