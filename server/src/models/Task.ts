import mongoose, { Schema } from "mongoose";
import { ITask, TaskPriority, TaskStatus } from "../types/task";

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "done", "archived"],
      default: "todo",
    },
    dueDate: {
      type: Date,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task owner is required"],
    },
  },
  {
    timestamps: true, // Автоматически добавляет createdAt и updatedAt
  }
);

const Task = mongoose.model<ITask>("Task", taskSchema);

export default Task;
