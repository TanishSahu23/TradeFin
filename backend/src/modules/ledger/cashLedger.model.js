import mongoose from "mongoose";

const cashLedgerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    type: {
      type: String,
      required: true,
      enum: [
        "INITIAL_CREDIT",
        "BUY",
        "SELL",
        "ADJUSTMENT",
      ],
    },

    amount: {
      type: Number,
      required: true,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },

    reference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trade",
    },

    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const CashLedger = mongoose.model(
  "CashLedger",
  cashLedgerSchema
);

export default CashLedger;