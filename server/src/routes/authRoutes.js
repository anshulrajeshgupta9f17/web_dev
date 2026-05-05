import { Router } from "express";
import { signup, login, signupValidators, loginValidators } from "../controllers/authController.js";

const router = Router();
router.post("/signup", signupValidators, signup);
router.post("/login", loginValidators, login);
export default router;
