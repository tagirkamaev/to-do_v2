import { body, param, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

// Правила валидации для создания и обновления задачи
export const validateTask = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),

  body("completed").optional().isBoolean().withMessage("Completed must be a boolean value"),
];

// Правила валидации для ID задачи
export const validateTaskId = [param("id").isMongoId().withMessage("Invalid task ID format")];

// Middleware для проверки результатов валидации
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
