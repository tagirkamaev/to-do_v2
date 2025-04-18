import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// interfaces
export interface Task {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: "low" | "medium" | "high";
  status?: "todo" | "in_progress" | "done";
  dueDate?: string;
  project?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  completed: boolean;
  priority?: "low" | "medium" | "high";
  status?: "todo" | "in_progress" | "done";
  dueDate?: string;
  project?: string; // ID проекта
}

// service
export const taskService = {
  getTasks: async () => {
    const response = await api.get("/tasks");
    return response.data;
  },

  getTasksByProject: async (projectId: string) => {
    const response = await api.get(`/tasks?project=${projectId}`);
    return response.data;
  },

  getTask: async (id: string) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (data: CreateTaskData) => {
    const response = await api.post("/tasks", data);
    return response.data;
  },

  updateTask: async (id: string, data: Partial<CreateTaskData>) => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};
