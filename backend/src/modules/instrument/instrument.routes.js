// Goal
// This file defines which URL calls which controller.

import validate from "../../middleware/validate.middleware.js";
import { instrumentIdSchema } from "./instrument.validation.js";
import express from "express";
import {
  getAllInstruments,
  getSingleInstrument,
} from "./instrument.controller.js";

const router = express.Router();

router.get("/", getAllInstruments);

router.get(
  "/:id",
  validate(instrumentIdSchema, "params"),
  getSingleInstrument
);

export default router;