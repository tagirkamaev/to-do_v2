import { Request, Response } from "express";
import Task from "../models/Task";
import Project from "../models/Project";

// Get all tasks for the current user
export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    // Параметры пагинации (по умолчанию: страница 1, 10 элементов на странице)
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Базовый запрос для текущего пользователя
    const query: any = { owner: userId };

    // Фильтрация
    if (req.query.projectId) {
      query.project = req.query.projectId;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

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
    if (req.query.startDate) {
      query.dueDate = { ...query.dueDate, $gte: new Date(req.query.startDate as string) };
    }

    if (req.query.endDate) {
      query.dueDate = { ...query.dueDate, $lte: new Date(req.query.endDate as string) };
    }

    // Сортировка (по умолчанию: по дате создания, убывание)
    const sortField = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "asc" ? 1 : -1;
    const sortOptions: any = {};
    sortOptions[sortField] = sortOrder;

    // Получение общего количества задач (для метаданных пагинации)
    const total = await Task.countDocuments(query);

    // Запрос задач с пагинацией и сортировкой
    const tasks = await Task.find(query)
      .populate("project", "title")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

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

    // Сравним ID проектов. Для этого приведем их к строке
    const currentProjectId = currentTask.project ? currentTask.project.toString() : null;
    const newProjectId = projectId ? projectId.toString() : null;

    if (currentProjectId !== newProjectId) {
      // Удаляем задачу из старого проекта (если он был)
      if (currentProjectId) {
        await Project.findByIdAndUpdate(currentProjectId, {
          $pull: { tasks: taskId },
        });
      }

      // Добавляем задачу в новый проект (если он есть)
      if (newProjectId) {
        await Project.findByIdAndUpdate(newProjectId, {
          $addToSet: { tasks: taskId },
        });
      }
    }

    // Обновляем саму задачу
    const updateData = {
      ...req.body,
      project: projectId, // Явно устанавливаем project
    };

    const task = await Task.findOneAndUpdate(
      { _id: taskId, owner: userId },
      { $set: updateData },
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
        $pull: { tasks: taskId },
      });
    }

    await Task.deleteOne({ _id: taskId, owner: userId });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting task", error });
  }
};

// Search tasks across all fields
export const searchTasks = async (req: Request, res: Response) => {
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

    // Создаем поисковый запрос по всем текстовым полям
    const query = {
      owner: userId,
      $or: [
        { title: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { status: { $regex: searchTerm, $options: "i" } },
        { priority: { $regex: searchTerm, $options: "i" } },
      ],
    };

    // Получаем общее количество результатов
    const total = await Task.countDocuments(query);

    // Выполняем поиск с пагинацией
    const tasks = await Task.find(query)
      .populate("project", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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
    res.status(500).json({ message: "Error searching tasks", error });
  }
};
