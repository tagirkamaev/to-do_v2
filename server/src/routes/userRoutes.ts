import express from "express";
import { register, login, getProfile, updateProfile } from "../controllers/userController";
import { auth } from "../middleware/auth";

const router = express.Router();

// Public
router.post("/register", register);
router.post("/login", login);

// Secure
router.get("/me", auth, getProfile);
router.put("/me", auth, updateProfile);

export default router;
