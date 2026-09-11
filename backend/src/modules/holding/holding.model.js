import mongoose from "mongoose";

const holdingSchema = new mongoose.Schema(
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

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    averageBuyPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    investedAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    realizedPnL: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

holdingSchema.index(
  { user: 1, instrument: 1 },
  { unique: true }
);

const Holding = mongoose.model(
  "Holding",
  holdingSchema
);

export default Holding;