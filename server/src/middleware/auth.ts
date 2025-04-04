import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../config/jwt";
import User from "../models/User";
import { IUserDocument } from "../types/user";

// Расширяем интерфейс Request, добавляя пользователя
declare global {
  namespace Express {
    interface Request {
      user: IUserDocument;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);

    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
