import { Request, Response } from "express";
import mongoose from "mongoose";
import Task from "../models/Task";
import Project from "../models/Project";

// Получение общей статистики для пользователя
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    // Общее количество задач
    const totalTasks = await Task.countDocuments({ owner: userId });

    // Завершенные и незавершенные задачи
    const completedTasks = await Task.countDocuments({ owner: userId, completed: true });
    const pendingTasks = totalTasks - completedTasks;

    // Количество проектов
    const totalProjects = await Project.countDocuments({ owner: userId });

    // Задачи с высоким приоритетом
    const highPriorityTasks = await Task.countDocuments({
      owner: userId,
      priority: "high",
      completed: false,
    });

    // Просроченные задачи (задачи с прошедшим сроком, которые не были завершены)
    const overdueTasks = await Task.countDocuments({
      owner: userId,
      dueDate: { $lt: new Date() },
      completed: false,
    });

    // Задачи на сегодня
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todayTasks = await Task.countDocuments({
      owner: userId,
      dueDate: { $gte: startOfDay, $lte: endOfDay },
    });

    // Задачи без проекта
    const tasksWithoutProject = await Task.countDocuments({
      owner: userId,
      project: { $exists: false },
    });

    res.status(200).json({
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      totalProjects,
      highPriorityTasks,
      overdueTasks,
      todayTasks,
      tasksWithoutProject,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user statistics", error });
  }
};

// Получение статистики по проектам
export const getProjectsStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    // Агрегация по проектам для получения статистики
    const projectStats = await Project.aggregate([
      // Поиск проектов пользователя
      { $match: { owner: new mongoose.Types.ObjectId(userId.toString()) } },

      // Добавление информации о задачах
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "project",
          as: "projectTasks",
        },
      },

      // Добавление полей статистики
      {
        $project: {
          _id: 1,
          title: 1,
          totalTasks: { $size: "$projectTasks" },
          completedTasks: {
            $size: {
              $filter: {
                input: "$projectTasks",
                as: "task",
                cond: { $eq: ["$$task.completed", true] },
              },
            },
          },
        },
      },

      // Добавление вычисляемых полей
      {
        $addFields: {
          pendingTasks: { $subtract: ["$totalTasks", "$completedTasks"] },
          completionRate: {
            $cond: [
              { $gt: ["$totalTasks", 0] },
              { $multiply: [{ $divide: ["$completedTasks", "$totalTasks"] }, 100] },
              0,
            ],
          },
        },
      },

      // Сортировка по количеству задач (убывание)
      { $sort: { totalTasks: -1 } },
    ]);

    res.status(200).json(projectStats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching project statistics", error });
  }
};

// Получение распределения задач по статусам
export const getTaskStatusDistribution = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    // Агрегация по статусам задач
    const statusDistribution = await Task.aggregate([
      // Поиск задач пользователя
      { $match: { owner: new mongoose.Types.ObjectId(userId.toString()) } },

      // Группировка по статусу
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },

      // Сортировка по количеству (убывание)
      { $sort: { count: -1 } },
    ]);

    res.status(200).json(statusDistribution);
  } catch (error) {
    res.status(500).json({ message: "Error fetching task status distribution", error });
  }
};
