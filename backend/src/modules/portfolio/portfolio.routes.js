import express from "express";

import protect from "../../middleware/auth.middleware.js";

import {
  getCashBalance,
  getPortfolioSummary,
  getPortfolioAllocation,
  createPortfolioSnapshot,
  getPortfolioSnapshots,
  getSectorAllocation,
} from "./portfolio.controller.js";

const router = express.Router();

router.get(
  "/cash",
  protect,
  getCashBalance
);

router.get(
  "/summary",
  protect,
  getPortfolioSummary
);

router.get(
  "/allocation",
  protect,
  getPortfolioAllocation
);

router.post(
  "/snapshots",
  protect,
  createPortfolioSnapshot
);

router.get(
  "/snapshots",
  protect,
  getPortfolioSnapshots
);

router.get(
  "/sector-allocation",
  protect,
  getSectorAllocation
);

export default router;