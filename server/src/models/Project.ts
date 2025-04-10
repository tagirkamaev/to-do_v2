import mongoose, { Schema } from "mongoose";
import { IProject } from "../types/project";

const projectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project owner is required"],
    },
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model<IProject>("Project", projectSchema);

export default Project;
