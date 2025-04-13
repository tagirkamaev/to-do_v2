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

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be one of: low, medium, high"),

  body("status")
    .optional()
    .isIn(["todo", "in_progress", "done", "archived"])
    .withMessage("Status must be one of: todo, in_progress, done, archived"),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date in ISO 8601 format"),
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
