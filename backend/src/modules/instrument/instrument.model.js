import mongoose from "mongoose";

const instrumentSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    exchange: {
      type: String,
      required: true,
      enum: ["NSE", "BSE"],
    },

    instrumentType: {
      type: String,
      enum: ["EQUITY", "INDEX"],
      required: true,
    },

    isin: {
      type: String,
      required: true,
      trim: true,
    },

    sector: {
      type: String,
      trim: true,
    },

    currentPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    previousClose: {
      type: Number,
      required: true,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Instrument = mongoose.model(
  "Instrument",
  instrumentSchema
);

export default Instrument;