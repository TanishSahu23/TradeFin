import "dotenv/config";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Instrument from "../modules/instrument/instrument.model.js";
import MarketPrice from "../modules/instrument/marketPrice.model.js";

const instruments = [
  "RELIANCE",
  "TCS",
  "INFY",
  "HDFCBANK",
  "ICICIBANK",
  "SBIN",
  "NIFTY50",
];

const instrumentProfiles = {
  RELIANCE: {
    volatility: 0.014,
    cycleSpeed: 8,
    phase: 0.2,
    trend: 0.0002,
  },

  TCS: {
    volatility: 0.010,
    cycleSpeed: 11,
    phase: 1.4,
    trend: 0.00015,
  },

  INFY: {
    volatility: 0.016,
    cycleSpeed: 7,
    phase: 2.2,
    trend: 0.0001,
  },

  HDFCBANK: {
    volatility: 0.009,
    cycleSpeed: 14,
    phase: 0.8,
    trend: 0.00018,
  },

  ICICIBANK: {
    volatility: 0.013,
    cycleSpeed: 10,
    phase: 2.8,
    trend: 0.00025,
  },

  SBIN: {
    volatility: 0.020,
    cycleSpeed: 6,
    phase: 3.6,
    trend: 0.0003,
  },

  NIFTY50: {
    volatility: 0.008,
    cycleSpeed: 13,
    phase: 1.1,
    trend: 0.0002,
  },
};

const generateHistoricalPrices = (
  instrument,
  days = 120
) => {
  const profile =
    instrumentProfiles[instrument.symbol];

  if (!profile) {
    throw new Error(
      `No historical price profile configured for ${instrument.symbol}`
    );
  }

  const prices = [];

  /*
   * Generate the historical series backwards from
   * a price below the current market price.
   *
   * The final generated close will be explicitly
   * aligned with Instrument.currentPrice so that
   * historical charts and portfolio valuation have
   * a consistent latest price.
   */
  let price =
    instrument.currentPrice * 0.9;

  const startDate = new Date();

  startDate.setHours(0, 0, 0, 0);

  startDate.setDate(
    startDate.getDate() - days
  );

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);

    date.setDate(
      startDate.getDate() + i
    );

    const dayOfWeek =
      date.getDay();

    if (
      dayOfWeek === 0 ||
      dayOfWeek === 6
    ) {
      continue;
    }

    const cycle =
      Math.sin(
        i / profile.cycleSpeed +
          profile.phase
      ) *
      profile.volatility;

    const secondaryCycle =
      Math.cos(
        i / 19 +
          profile.phase
      ) *
      profile.volatility *
      0.45;

    const dailyMovement =
      cycle +
      secondaryCycle +
      profile.trend;

    const open =
      price *
      (1 + dailyMovement * 0.35);

    let close =
      price *
      (1 + dailyMovement);

    const high =
      Math.max(open, close) *
      (1 +
        profile.volatility * 0.35);

    const low =
      Math.min(open, close) *
      (1 -
        profile.volatility * 0.35);

    const volume =
      Math.round(
        500000 +
          Math.abs(
            Math.sin(
              i / 10 +
                profile.phase
            )
          ) *
            2000000
      );

    prices.push({
      instrument:
        instrument._id,

      date,

      open: Number(
        open.toFixed(2)
      ),

      high: Number(
        high.toFixed(2)
      ),

      low: Number(
        low.toFixed(2)
      ),

      close: Number(
        close.toFixed(2)
      ),

      volume,
    });

    price = close;
  }

  /*
   * Align the latest historical close with
   * Instrument.currentPrice.
   *
   * This makes:
   *
   * MarketPrice.latest.close
   * ==
   * Instrument.currentPrice
   */
  if (prices.length > 0) {
    const latest =
      prices[prices.length - 1];

    latest.close =
      instrument.currentPrice;

    latest.high = Math.max(
      latest.open,
      latest.close
    );

    latest.low = Math.min(
      latest.open,
      latest.close
    );
  }

  return prices;
};

const seedMarketPrices =
  async () => {
    try {
      await connectDB();

      for (const symbol of instruments) {
        const instrument =
          await Instrument.findOne({
            symbol,
            isActive: true,
          });

        if (!instrument) {
          console.log(
            `Instrument not found: ${symbol}`
          );

          continue;
        }

        const prices =
          generateHistoricalPrices(
            instrument
          );

        await MarketPrice.deleteMany({
          instrument:
            instrument._id,
        });

        await MarketPrice.insertMany(
          prices
        );

        console.log(
          `${symbol}: ${prices.length} historical records inserted`
        );
      }

      console.log(
        "Historical market prices seeded successfully"
      );
    } catch (error) {
      console.error(
        `Market price seeding failed: ${error.message}`
      );
    } finally {
      await mongoose.connection.close();
    }
  };

seedMarketPrices();