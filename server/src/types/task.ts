import { ObjectId } from "mongodb";

export interface ITask {
  title: string;
  description?: string;
  completed: boolean;
  project?: ObjectId;
  owner: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskDocument extends ITask {
  _id: ObjectId;
}
