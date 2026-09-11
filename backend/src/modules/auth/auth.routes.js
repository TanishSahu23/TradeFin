import express from "express";

import validate from "../../middleware/validate.middleware.js";
import protect from "../../middleware/auth.middleware.js";

import {
  registerUser,
  loginUser,
  getMe,
} from "./auth.controller.js";

import {
  registerSchema,
  loginSchema,
} from "./auth.validation.js";

const router = express.Router();

router.post(
  "/register",
  validate(registerSchema, "body"),
  registerUser
);

router.post(
  "/login",
  validate(loginSchema, "body"),
  loginUser
);

router.get(
  "/me",
  protect,
  getMe
);

export default router;