import express from "express";

import protect from "../../middleware/auth.middleware.js";

import {
  getMyHoldings,
} from "./holding.controller.js";

const router = express.Router();

router.get(
  "/",
  protect,
  getMyHoldings
);

export default router;