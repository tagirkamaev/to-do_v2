export interface ITask {
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskDocument extends ITask {
  _id: string;
}
