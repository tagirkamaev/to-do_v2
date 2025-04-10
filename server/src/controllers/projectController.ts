import { Request, Response } from "express";
import Project from "../models/Project";
import Task from "../models/Task";

// Get all projects for the current user
export const getProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const projects = await Project.find({ owner: userId })
      .populate({
        path: "tasks",
        select: "title description completed createdAt",
        match: { owner: userId },
      })
      .sort({ createdAt: -1 });
    res.status(200).json(projects);
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

    const tasks = await Task.find({ project: projectId, owner: userId }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
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
      { $addToSet: { tasks: taskId } },
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
      { $pull: { tasks: taskId } },
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
