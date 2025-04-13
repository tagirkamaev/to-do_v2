import { Request, Response } from "express";
import mongoose from "mongoose";
import Project from "../models/Project";
import Task from "../models/Task";

// Get all projects for the current user
export const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    // Параметры пагинации
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Базовый запрос для текущего пользователя
    const query: any = { owner: userId };

    // Поиск по названию
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: "i" };
    }

    // Фильтрация по дате создания
    if (req.query.startDate) {
      query.createdAt = { ...query.createdAt, $gte: new Date(req.query.startDate as string) };
    }

    if (req.query.endDate) {
      query.createdAt = { ...query.createdAt, $lte: new Date(req.query.endDate as string) };
    }

    // Сортировка (по умолчанию: по дате создания, убывание)
    const sortField = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "asc" ? 1 : -1;
    const sortOptions: any = {};
    sortOptions[sortField] = sortOrder;

    // Получение общего количества проектов
    const total = await Project.countDocuments(query);

    // Запрос проектов с пагинацией и сортировкой
    const projects = await Project.find(query)
      .populate({
        path: "tasks",
        select: "title description completed createdAt",
        match: { owner: userId },
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Возвращаем проекты и метаданные пагинации
    res.status(200).json({
      projects,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error });
  }
};

// Create new project
export const createProject = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const project = await Project.create({
      ...req.body,
      owner: userId,
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: "Error creating project", error });
  }
};

// Update project
export const updateProject = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: userId },
      { $set: req.body },
      { new: true }
    ).populate({
      path: "tasks",
      select: "title description completed createdAt",
      match: { owner: userId },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found or you don't have access to it" });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(400).json({ message: "Error updating project", error });
  }
};

// Delete project
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const projectId = req.params.id;

    // Удаляем все задачи проекта
    await Task.deleteMany({ project: projectId, owner: userId });

    const project = await Project.findOneAndDelete({ _id: projectId, owner: userId });
    if (!project) {
      return res.status(404).json({ message: "Project not found or you don't have access to it" });
    }
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting project", error });
  }
};

// Get all tasks for a project
export const getProjectTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const projectId = req.params.id;

    // Проверяем, что проект существует и принадлежит пользователю
    const project = await Project.findOne({ _id: projectId, owner: userId });
    if (!project) {
      return res.status(404).json({ message: "Project not found or you don't have access to it" });
    }

    // Параметры пагинации
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Базовый запрос для задач проекта
    const query: any = { project: projectId, owner: userId };

    // Фильтрация по статусу
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Фильтрация по приоритету
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    // Поиск по тексту
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Фильтрация по дате
    if (req.query.completed) {
      query.completed = req.query.completed === "true";
    }

    // Сортировка (по умолчанию: по дате создания, убывание)
    const sortField = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "asc" ? 1 : -1;
    const sortOptions: any = {};
    sortOptions[sortField] = sortOrder;

    // Получение общего количества задач
    const total = await Task.countDocuments(query);

    // Запрос задач проекта с пагинацией и сортировкой
    const tasks = await Task.find(query).sort(sortOptions).skip(skip).limit(limit);

    // Возвращаем задачи и метаданные пагинации
    res.status(200).json({
      tasks,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching project tasks", error });
  }
};

// Add task to project
export const addTaskToProject = async (req: Request, res: Response) => {
  try {
    const { projectId, taskId } = req.params;
    const project = await Project.findByIdAndUpdate(
      projectId,
      { $addToSet: { tasks: new mongoose.Types.ObjectId(taskId) } },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(400).json({ message: "Error adding task to project", error });
  }
};

// Remove task from project
export const removeTaskFromProject = async (req: Request, res: Response) => {
  try {
    const { projectId, taskId } = req.params;
    const project = await Project.findByIdAndUpdate(
      projectId,
      { $pull: { tasks: new mongoose.Types.ObjectId(taskId) } },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(400).json({ message: "Error removing task from project", error });
  }
};

// Search projects
export const searchProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const searchTerm = req.query.q as string;

    if (!searchTerm) {
      return res.status(400).json({ message: "Search term is required" });
    }

    // Параметры пагинации
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Создаем поисковый запрос по полям проекта
    const query = {
      owner: userId,
      $or: [
        { title: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ],
    };

    // Получаем общее количество результатов
    const total = await Project.countDocuments(query);

    // Выполняем поиск с пагинацией
    const projects = await Project.find(query)
      .populate({
        path: "tasks",
        select: "title description completed createdAt",
        match: { owner: userId },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      projects,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error searching projects", error });
  }
};
