import { body, param, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

// Правила валидации для создания и обновления проекта
export const validateProject = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),
];

// Правила валидации для ID проекта
export const validateProjectId = [param("id").isMongoId().withMessage("Invalid project ID format")];

// Правила валидации для ID задачи
export const validateTaskId = [param("taskId").isMongoId().withMessage("Invalid task ID format")];

// Middleware для проверки результатов валидации
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
