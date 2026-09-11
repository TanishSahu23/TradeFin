import express from "express";

import protect from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import { instrumentIdSchema } from "../instrument/instrument.validation.js";

import {
  betaQuerySchema,
} from "./quantitativeAnalysis.validation.js";

import {
  getCorrelationMatrix,
  getBeta,
} from "./quantitativeAnalysis.controller.js";

const router = express.Router();

router.get(
  "/correlation",
  protect,
  getCorrelationMatrix
);

router.get(
  "/beta/:id",
  protect,
  validate(instrumentIdSchema, "params"),
  validate(betaQuerySchema, "query"),
  getBeta
);

export default router;