import { ObjectId } from "mongodb";

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done" | "archived";

export interface ITask {
  title: string;
  description?: string;
  completed: boolean;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: Date;
  project?: ObjectId;
  owner: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskDocument extends ITask {
  _id: ObjectId;
}
