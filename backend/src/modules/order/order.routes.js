import express from "express";

import protect from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import { createOrderSchema } from "./order.validation.js";

import {
  createOrder,
  getMyOrders,
} from "./order.controller.js";

const router = express.Router();

router.get(
  "/",
  protect,
  getMyOrders
);

router.post(
  "/",
  protect,
  validate(createOrderSchema, "body"),
  createOrder
);

export default router;