import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// перехватчик запросов для автоматического добавления токена
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

// Обработчик ответов для обработки общих ошибок
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const endpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    profile: "/auth/me",
    updateProfile: "/auth/me",
  },
  projects: {
    getAll: "/projects",
    getOne: (id: string) => `/projects/${id}`,
    create: "/projects",
    update: (id: string) => `/projects${id}`,
    delete: (id: string) => `/projects${id}`,
    getTasks: (id: string) => `/projects${id}/tasks`,
  },
  tasks: {
    getAll: "/tasks",
    getOne: (id: string) => `/tasks/${id}`,
    create: "/tasks",
    update: (id: string) => `/tasks/${id}`,
    delete: (id: string) => `/tasks/${id}`,
    search: "/tasks/search",
  },
  stats: {
    getUserStats: "/stats/user",
  },
};

export const callApi = async (endpoint: string, method = "GET", data = null) => {
  try {
    const config = {
      method,
      url: endpoint,
      data,
    };

    const response = await api(config);
    return response.data;
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
};
