import mongoose, { Schema } from "mongoose";
import { ITask } from "../types/task";

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
