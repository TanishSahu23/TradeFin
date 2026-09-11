import express from "express";

import validate from "../../middleware/validate.middleware.js";

import {
  instrumentIdSchema,
} from "./instrument.validation.js";

import {
  historicalPriceQuerySchema,
} from "./marketPrice.validation.js";

import {
  getHistoricalPrices,
  getLatestPrice,
} from "./marketPrice.controller.js";

const router = express.Router();

router.get(
  "/:id/history",
  validate(instrumentIdSchema, "params"),
  validate(historicalPriceQuerySchema, "query"),
  getHistoricalPrices
);

router.get(
  "/:id/latest",
  validate(instrumentIdSchema, "params"),
  getLatestPrice
);

export default router;
