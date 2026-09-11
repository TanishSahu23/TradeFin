import mongoose from "mongoose";

const ipoSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    symbol: {
      type: String,
      trim: true,
      uppercase: true,
    },

    exchange: {
      type: String,
      enum: ["NSE", "BSE"],
    },

    status: {
      type: String,
      required: true,
      enum: [
        "UPCOMING",
        "OPEN",
        "CLOSED",
        "LISTED",
        "CANCELLED",
      ],
    },

    openDate: {
      type: Date,
    },

    closeDate: {
      type: Date,
    },

    listingDate: {
      type: Date,
    },

    priceBandMin: {
      type: Number,
      min: 0.01,
    },

    priceBandMax: {
      type: Number,
      min: 0.01,
    },

    lotSize: {
      type: Number,
      min: 1,
    },

    issueSize: {
      type: Number,
      min: 0,
    },

    subscription: {
      type: Number,
      min: 0,
    },

    listingPrice: {
      type: Number,
      min: 0.01,
    },

    currentPrice: {
      type: Number,
      min: 0.01,
    },

    revenue: {
      type: Number,
      min: 0,
    },

    profit: {
      type: Number,
    },

    peRatio: {
      type: Number,
      min: 0.01,
    },

    revenueGrowth: {
      type: Number,
    },

    profitGrowth: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const IPO = mongoose.model(
  "IPO",
  ipoSchema
);

export default IPO;