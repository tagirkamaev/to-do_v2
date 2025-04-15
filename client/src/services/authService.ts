import axios from "axios";

// Экземпляр axios с базовым URL
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Добавляем перехватчик запросов для автоматического добавления токена
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// функции для работы с API
export const authService = {
  // регистрация пользователя
  register: async (data: RegisterData) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  // вход
  login: async (credentials: LoginCredentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  // получение профиля
  getProfile: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // обновление профиля
  updateProfile: async (data: Partial<User>) => {
    const response = await api.put("/auth/me", data);
    return response.data;
  },
};
