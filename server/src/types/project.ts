import { ObjectId } from "mongodb";

export interface IProject {
  title: string;
  owner: ObjectId;
  tasks: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectDocument extends IProject {
  _id: ObjectId;
}
