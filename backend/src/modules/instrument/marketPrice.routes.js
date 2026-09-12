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
  syncMarketData,
} from "./marketPrice.controller.js";

const router =
  express.Router();

/**
 * GET historical prices
 *
 * Example:
 *
 * GET
 * /api/v1/market-prices/:id/history
 */
router.get(
  "/:id/history",

  validate(
    instrumentIdSchema,
    "params"
  ),

  validate(
    historicalPriceQuerySchema,
    "query"
  ),

  getHistoricalPrices
);

/**
 * GET latest price
 *
 * IMPORTANT:
 *
 * This reads from MongoDB.
 *
 * It does NOT call Alpha Vantage.
 */
router.get(
  "/:id/latest",

  validate(
    instrumentIdSchema,
    "params"
  ),

  getLatestPrice
);

/**
 * POST synchronize market data
 *
 * This calls Alpha Vantage and saves
 * the returned data into MongoDB.
 *
 * Example:
 *
 * POST
 * /api/v1/market-prices/:id/sync
 */
router.post(
  "/:id/sync",

  validate(
    instrumentIdSchema,
    "params"
  ),

  syncMarketData
);

export default router;