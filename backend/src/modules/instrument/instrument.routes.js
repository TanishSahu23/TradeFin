import express from "express";

import validate from "../../middleware/validate.middleware.js";

import {
  getAllInstruments,
  getSingleInstrument,
  searchInstruments,
} from "./instrument.controller.js";

import {
  instrumentIdSchema,
} from "./instrument.validation.js";

const router =
  express.Router();

/**
 * Search instruments.
 *
 * IMPORTANT:
 * This must be before /:id.
 */
router.get(
  "/search",
  searchInstruments
);

/**
 * Get all active instruments.
 */
router.get(
  "/",
  getAllInstruments
);

/**
 * Get one instrument.
 */
router.get(
  "/:id",
  validate(
    instrumentIdSchema,
    "params"
  ),
  getSingleInstrument
);

export default router;