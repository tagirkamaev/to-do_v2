export interface IProject {
  title: string;
  tasks: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectDocument extends IProject {
  _id: string;
}
