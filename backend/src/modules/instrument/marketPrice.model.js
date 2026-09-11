import mongoose from "mongoose";

const marketPriceSchema = new mongoose.Schema(
  {
    instrument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instrument",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    open: {
      type: Number,
      required: true,
      min: 0,
    },

    high: {
      type: Number,
      required: true,
      min: 0,
    },

    low: {
      type: Number,
      required: true,
      min: 0,
    },

    close: {
      type: Number,
      required: true,
      min: 0,
    },

    volume: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

marketPriceSchema.index(
  {
    instrument: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

const MarketPrice = mongoose.model(
  "MarketPrice",
  marketPriceSchema
);

export default MarketPrice;