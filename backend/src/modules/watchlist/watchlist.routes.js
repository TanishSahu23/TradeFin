import express from "express";
import protect from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import {
  addToWatchlistSchema,
  removeFromWatchlistSchema,
} from "./watchlist.validation.js";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "./watchlist.controller.js";

const router = express.Router();

router.get(
  "/",
  protect,
  getWatchlist
);

router.post(
  "/",
  protect,
  validate(addToWatchlistSchema, "body"),
  addToWatchlist
);

router.delete(
  "/:instrumentId",
  protect,
  validate(removeFromWatchlistSchema, "params"),
  removeFromWatchlist
);

export default router;