import MarketPrice from "./marketPrice.model.js";

import AppError from "../../utils/AppError.js";

import Instrument from "../instrument/instrument.model.js";

import {
  getQuote,
  getHistoricalPrices as getHistoricalPricesFromProvider,
} from "../../integrations/marketData/marketData.service.js";

/**
 * Get historical prices from MongoDB.
 *
 * IMPORTANT:
 *
 * This function does NOT call Alpha Vantage.
 *
 * Alpha Vantage data is first synchronized
 * using the /sync endpoint.
 *
 * Then the frontend can safely request
 * historical data from MongoDB.
 */
export const getHistoricalPrices = async (
  instrumentId,
  filters = {}
) => {
  const instrument =
    await Instrument.findById(
      instrumentId
    ).lean();

  if (!instrument) {
    throw new AppError(
      "Instrument not found",
      404
    );
  }

  const query = {
    instrument: instrumentId,
  };

  /**
   * Apply optional date filters.
   *
   * Example:
   *
   * /history?from=2026-09-01&to=2026-09-11
   */
  if (
    filters.from ||
    filters.to
  ) {
    query.date = {};

    if (filters.from) {
      const fromDate =
        new Date(filters.from);

      if (
        Number.isNaN(
          fromDate.getTime()
        )
      ) {
        throw new AppError(
          "Invalid from date",
          400
        );
      }

      query.date.$gte =
        fromDate;
    }

    if (filters.to) {
      const toDate =
        new Date(filters.to);

      if (
        Number.isNaN(
          toDate.getTime()
        )
      ) {
        throw new AppError(
          "Invalid to date",
          400
        );
      }

      /**
       * Our stored market-price dates
       * represent trading days at midnight,
       * so this includes the requested
       * `to` date.
       */
      query.date.$lte =
        toDate;
    }
  }

  const prices =
    await MarketPrice.find(query)
      .sort({
        date: 1,
      })
      .lean();

  /**
   * Return frontend-friendly data.
   */
  return prices.map(
    (price) => ({
      instrument:
        instrument._id,

      symbol:
        instrument.symbol,

      exchange:
        instrument.exchange,

      date:
        price.date,

      open:
        price.open,

      high:
        price.high,

      low:
        price.low,

      close:
        price.close,

      volume:
        price.volume,
    })
  );
};

/**
 * Get the latest price from MongoDB.
 *
 * IMPORTANT:
 *
 * This function does NOT call Alpha Vantage.
 *
 * The sync endpoint is responsible for
 * keeping MongoDB updated.
 */
export const getLatestPrice = async (
  instrumentId
) => {
  const instrument =
    await Instrument.findById(
      instrumentId
    ).lean();

  if (!instrument) {
    throw new AppError(
      "Instrument not found",
      404
    );
  }

  const latestPrice =
    await MarketPrice.findOne({
      instrument: instrumentId,
    })
      .sort({
        date: -1,
      })
      .lean();

  if (!latestPrice) {
    throw new AppError(
      "Market price data not found. Please synchronize market data first.",
      404
    );
  }

  /**
   * Find the previous trading day's
   * price so we can calculate change.
   */
  const previousPrice =
    await MarketPrice.findOne({
      instrument: instrumentId,

      date: {
        $lt: latestPrice.date,
      },
    })
      .sort({
        date: -1,
      })
      .lean();

  const currentPrice =
    latestPrice.close;

  const previousClose =
    previousPrice?.close;

  let change;

  let changePercent;

  if (
    previousClose !== undefined &&
    previousClose !== null &&
    previousClose !== 0
  ) {
    change =
      currentPrice -
      previousClose;

    changePercent =
      (change /
        previousClose) *
      100;
  }

  return {
    instrument:
      instrument._id,

    symbol:
      instrument.symbol,

    exchange:
      instrument.exchange,

    currentPrice,

    previousClose,

    open:
      latestPrice.open,

    high:
      latestPrice.high,

    low:
      latestPrice.low,

    volume:
      latestPrice.volume,

    change,

    changePercent,

    timestamp:
      latestPrice.date,
  };
};

/**
 * Synchronize market data for one instrument.
 *
 * Flow:
 *
 * Instrument
 *      ↓
 * symbol + exchange
 *      ↓
 * Alpha Vantage
 *      ↓
 * normalized historical data
 *      ↓
 * MongoDB
 *
 * Existing records are updated.
 * New records are inserted.
 */
export const syncMarketDataForInstrument =
  async (instrumentId) => {
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

    /**
     * Fetch historical data from
     * the configured market-data provider.
     */
    const providerPrices =
      await getHistoricalPricesFromProvider(
        instrument.symbol,
        instrument.exchange,
        {
          outputsize: "compact",
        }
      );

    if (
      !providerPrices ||
      providerPrices.length === 0
    ) {
      throw new AppError(
        `No market data found for ${instrument.symbol}`,
        404
      );
    }

    /**
     * Prepare MongoDB bulk operations.
     *
     * Unique key:
     *
     * instrument + date
     *
     * This prevents duplicate records.
     */
    const operations =
      providerPrices.map(
        (price) => ({
          updateOne: {
            filter: {
              instrument:
                instrument._id,

              date:
                price.date,
            },

            update: {
              $set: {
                instrument:
                  instrument._id,

                date:
                  price.date,

                open:
                  price.open,

                high:
                  price.high,

                low:
                  price.low,

                close:
                  price.close,

                volume:
                  price.volume,
              },
            },

            upsert: true,
          },
        })
      );

    const result =
      await MarketPrice.bulkWrite(
        operations
      );

    /**
     * Find the newest price returned
     * by the provider.
     */
    const latestProviderPrice =
      [...providerPrices].sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      )[0];

    /**
     * Find the previous trading day.
     */
    const previousProviderPrice =
      [...providerPrices]
        .filter(
          (price) =>
            new Date(price.date) <
            new Date(
              latestProviderPrice.date
            )
        )
        .sort(
          (a, b) =>
            new Date(b.date) -
            new Date(a.date)
        )[0];

    /**
     * Keep the Instrument document's
     * current price synchronized as well.
     */
    instrument.currentPrice =
      latestProviderPrice.close;

    if (
      previousProviderPrice
    ) {
      instrument.previousClose =
        previousProviderPrice.close;
    }

    await instrument.save();

    /**
     * MongoDB bulkWrite gives us:
     *
     * upsertedCount
     * modifiedCount
     *
     * Depending on MongoDB/Mongoose version,
     * matched records may be unchanged.
     */
    const recordsInserted =
      result.upsertedCount || 0;

    const recordsUpdated =
      result.modifiedCount || 0;

    return {
      instrument:
        instrument._id,

      symbol:
        instrument.symbol,

      exchange:
        instrument.exchange,

      recordsReceived:
        providerPrices.length,

      recordsInserted,

      recordsUpdated,

      latestDate:
        new Date(
          latestProviderPrice.date
        ),

      latestPrice:
        Number(
          latestProviderPrice.close
        ),
    };
  };