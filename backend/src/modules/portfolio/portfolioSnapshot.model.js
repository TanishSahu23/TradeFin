import mongoose from "mongoose";

const portfolioSnapshotSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    cashBalance: {
      type: Number,
      required: true,
      min: 0,
    },

    investedAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    portfolioValue: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPnL: {
      type: Number,
      required: true,
    },

    dailyPnL: {
      type: Number,
      required: true,
    },

    externalCashFlow: {
      type: Number,
      default: 0,
    },

    dailyReturn: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

portfolioSnapshotSchema.index(
  { user: 1, date: 1 },
  { unique: true }
);

const PortfolioSnapshot = mongoose.model(
  "PortfolioSnapshot",
  portfolioSnapshotSchema
);

export default PortfolioSnapshot;