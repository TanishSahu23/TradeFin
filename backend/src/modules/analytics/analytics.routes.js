import express from "express";

import protect from "../../middleware/auth.middleware.js";

import {
  getPerformanceAnalytics,
  getRiskAnalytics,
  getDiversificationAnalytics,
} from "./analytics.controller.js";

const router = express.Router();

router.get(
  "/performance",
  protect,
  getPerformanceAnalytics
);

router.get(
  "/risk",
  protect,
  getRiskAnalytics
);

router.get(
  "/diversification",
  protect,
  getDiversificationAnalytics
);

export default router;