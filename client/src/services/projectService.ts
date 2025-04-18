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
export interface Project {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
}

// service
export const projectService = {
  // get all projects
  getProjects: async () => {
    const response = await api.get("/projects/");
    return response.data;
  },

  // get specific project (by id)
  getProject: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response;
  },

  createProject: async (data: CreateProjectData) => {
    const response = await api.post("projects/", data);
    return response.data;
  },

  updateProject: async (id: string, data: Partial<CreateProjectData>) => {
    const response = await api.put(`projects/${id}`, data);
    return response.data;
  },

  deleteProject: async (id: string) => {
    const response = await api.delete(`projects/${id}`);
    return response.data;
  },
};
