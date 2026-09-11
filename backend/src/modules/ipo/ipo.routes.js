import express from "express";

import protect from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import { ipoIdSchema } from "./ipo.validation.js";
import { ipoTrackingIdSchema } from "./ipoTracking.validation.js";

import {
  getAllIPOs,
  getIPOById,
} from "./ipo.controller.js";

import {
  trackIPO,
  untrackIPO,
  getTrackedIPOs,
} from "./ipoTracking.controller.js";

const router = express.Router();

router.get("/tracked", protect, getTrackedIPOs);

router.post(
  "/:id/track",
  protect,
  validate(ipoTrackingIdSchema, "params"),
  trackIPO
);

router.delete(
  "/:id/track",
  protect,
  validate(ipoTrackingIdSchema, "params"),
  untrackIPO
);

router.get(
  "/:id",
  validate(ipoIdSchema, "params"),
  getIPOById
);

router.get("/", getAllIPOs);

export default router;