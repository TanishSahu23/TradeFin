import JournalEntry from "./journal.model.js";
import Instrument from "../instrument/instrument.model.js";
import Trade from "../trade/trade.model.js";

import AppError from "../../utils/AppError.js";

export const createJournalEntry = async (
  userId,
  journalData
) => {
  const {
    instrumentId,
    tradeId,
    action,
    price,
    quantity,
    reason,
    confidence,
    exitPrice,
    outcomePnL,
  } = journalData;

  const instrument =
    await Instrument.findById(
      instrumentId
    );

  if (!instrument) {
    throw new AppError(
      "Instrument not found",
      404
    );
  }

  let trade = null;

  if (tradeId) {
    trade = await Trade.findOne({
      _id: tradeId,
      user: userId,
    });

    if (!trade) {
      throw new AppError(
        "Trade not found",
        404
      );
    }

    if (
      trade.instrument.toString() !==
      instrumentId
    ) {
      throw new AppError(
        "Trade does not belong to the selected instrument",
        400
      );
    }

    if (trade.side !== action) {
      throw new AppError(
        "Journal action must match the linked trade side",
        400
      );
    }

    if (
      quantity !== undefined &&
      quantity !== trade.quantity
    ) {
      throw new AppError(
        "Journal quantity must match the linked trade quantity",
        400
      );
    }

    if (
      price !== trade.executionPrice
    ) {
      throw new AppError(
        "Journal price must match the linked trade execution price",
        400
      );
    }
  }

  const journalEntry =
    await JournalEntry.create({
      user: userId,
      instrument: instrumentId,
      trade: tradeId,
      action,
      price,
      quantity,
      reason,
      confidence,
      exitPrice,
      outcomePnL,
    });

  return await journalEntry.populate(
    "instrument"
  );
};

export const getMyJournalEntries =
  async (userId) => {
    return await JournalEntry.find({
      user: userId,
    })
      .populate("instrument")
      .populate("trade")
      .sort({
        createdAt: -1,
      });
  };

export const getJournalEntryById =
  async (userId, journalId) => {
    const journalEntry =
      await JournalEntry.findOne({
        _id: journalId,
        user: userId,
      })
        .populate("instrument")
        .populate("trade");

    if (!journalEntry) {
      throw new AppError(
        "Journal entry not found",
        404
      );
    }

    return journalEntry;
  };

export const updateJournalOutcome =
  async (
    userId,
    journalId,
    outcomeData
  ) => {
    const {
      exitPrice,
      outcomePnL,
    } = outcomeData;

    const journalEntry =
      await JournalEntry.findOne({
        _id: journalId,
        user: userId,
      });

    if (!journalEntry) {
      throw new AppError(
        "Journal entry not found",
        404
      );
    }

    if (
      journalEntry.exitPrice !==
      undefined
    ) {
      throw new AppError(
        "Journal entry is already closed",
        400
      );
    }

    if (
      journalEntry.action === "HOLD"
    ) {
      throw new AppError(
        "HOLD journal entries cannot be closed with an exit price",
        400
      );
    }

    journalEntry.exitPrice =
      exitPrice;

    journalEntry.outcomePnL =
      outcomePnL;

    await journalEntry.save();

    return await journalEntry.populate(
      "instrument"
    );
  };