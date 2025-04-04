import { Document } from "mongoose";
import { ObjectId } from "mongodb";

export interface IUser {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserDocument extends IUser, Document {
  _id: ObjectId;
}
