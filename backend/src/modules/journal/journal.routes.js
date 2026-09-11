import express from "express";

import protect from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import { instrumentIdSchema } from "../instrument/instrument.validation.js";
import { createJournalSchema,updateJournalSchema, } from "./journal.validation.js";

import {
  createJournalEntry,
  getMyJournalEntries,
  getJournalEntryById,
  updateJournalOutcome,
} from "./journal.controller.js";

const router = express.Router();

router.get("/", protect, getMyJournalEntries);

router.post(
  "/",
  protect,
  validate(createJournalSchema, "body"),
  createJournalEntry
);

router.get(
  "/:id",
  protect,
  validate(instrumentIdSchema, "params"),
  getJournalEntryById
);

router.put(
  "/:id",
  protect,
  validate(instrumentIdSchema, "params"),
  validate(updateJournalSchema, "body"),
  updateJournalOutcome
);

export default router;