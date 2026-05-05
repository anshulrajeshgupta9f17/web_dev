import jwt from "jsonwebtoken";
import { validationResult, body } from "express-validator";
import { User } from "../models/User.js";

const sign = (user) =>
  jwt.sign({ sub: user._id.toString(), email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const signupValidators = [
  body("email").isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 8, max: 72 }),
  body("displayName").optional().isString().trim().isLength({ max: 60 }),
];

export const loginValidators = [
  body("email").isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 1, max: 72 }),
];

export const signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, displayName } = req.body;
    if (await User.exists({ email })) return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ email, passwordHash, displayName });
    res.status(201).json({ token: sign(user), user: { id: user._id, email: user.email, displayName: user.displayName } });
  } catch (e) { next(e); }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ token: sign(user), user: { id: user._id, email: user.email, displayName: user.displayName } });
  } catch (e) { next(e); }
};
