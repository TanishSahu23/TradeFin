import express from "express";

import validate from "../../middleware/validate.middleware.js";
import { instrumentIdSchema } from "../instrument/instrument.validation.js";

import {
  getTechnicalAnalysis,
} from "./technicalAnalysis.controller.js";

const router = express.Router();

router.get(
  "/instruments/:id/technicals",
  validate(instrumentIdSchema, "params"),
  getTechnicalAnalysis
);

export default router;