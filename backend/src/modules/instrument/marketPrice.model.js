import mongoose from "mongoose";

const marketPriceSchema =
  new mongoose.Schema(
    {
      instrument: {
        type:
          mongoose.Schema.Types.ObjectId,

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

      /**
       * Actual symbol used by the
       * external market-data provider.
       *
       * Example:
       *
       * HDFCBANK.BSE
       */
      providerSymbol: {
        type: String,

        trim: true,
      },

      /**
       * Actual exchange/source returned
       * by the market-data provider.
       *
       * Example:
       *
       * India/Bombay
       */
      providerExchange: {
        type: String,

        trim: true,
      },
    },
    {
      timestamps: true,
    }
  );

/**
 * Prevent duplicate daily candles
 * for the same TradeFin instrument.
 */
marketPriceSchema.index(
  {
    instrument: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

/**
 * Useful when querying an instrument's
 * latest historical data.
 */
marketPriceSchema.index({
  instrument: 1,
  date: -1,
});

const MarketPrice =
  mongoose.model(
    "MarketPrice",
    marketPriceSchema
  );

export default MarketPrice;