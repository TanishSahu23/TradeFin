import mongoose from "mongoose";

const journalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    instrument: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Instrument",
    },

    trade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trade",
    },

    action: {
      type: String,
      required: true,
      enum: ["BUY", "SELL", "HOLD"],
    },

    price: {
      type: Number,
      required: true,
      min: 0.01,
    },

    quantity: {
      type: Number,
      min: 1,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    confidence: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    exitPrice: {
      type: Number,
      min: 0.01,
    },

    outcomePnL: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const JournalEntry = mongoose.model(
  "Journal",
  journalSchema
);

export default JournalEntry;