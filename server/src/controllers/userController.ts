import { Request, Response } from "express";
import User from "../models/User";
import { generateToken } from "../config/jwt";
import { IUserDocument } from "../types/user";

// Регистрация пользователя
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Создаем нового пользователя
    const newUser = await User.create({
      email,
      password,
      name,
    });

    // Генерируем токен
    const token = generateToken(newUser as IUserDocument);

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

// Вход пользователя
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Находим пользователя
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Проверяем пароль
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    // Генерируем токен
    const token = generateToken(user as IUserDocument);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

// Получение профиля пользователя
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    res.status(400).json({ message: "Error fetching profile", error });
  }
};

// Обновление профиля пользователя
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const user = req.user;

    user.name = name;
    await user.save();

    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    res.status(400).json({ message: "Error updating profile", error });
  }
};
