import getMarketDataClient from "./marketData.factory.js";

import {
  mapQuote,
  mapHistoricalPrice,
} from "./marketData.mapper.js";

/**
 * Get the latest market quote.
 *
 * Flow:
 *
 * symbol + exchange
 *        ↓
 * marketData.factory
 *        ↓
 * Alpha Vantage client
 *        ↓
 * provider response
 *        ↓
 * mapQuote
 */
export const getQuote = async (
  symbol,
  exchange
) => {
  const marketDataClient =
    getMarketDataClient();

  const providerData =
    await marketDataClient.getQuote(
      symbol,
      exchange
    );

  return mapQuote(
    providerData
  );
};

/**
 * Get historical market prices.
 *
 * Flow:
 *
 * symbol + exchange
 *        ↓
 * marketData.factory
 *        ↓
 * Alpha Vantage client
 *        ↓
 * provider historical data
 *        ↓
 * mapHistoricalPrice
 */
export const getHistoricalPrices =
  async (
    symbol,
    exchange,
    options = {}
  ) => {
    const marketDataClient =
      getMarketDataClient();

    const providerData =
      await marketDataClient.getHistoricalPrices(
        symbol,
        exchange,
        options
      );

    return providerData.map(
      mapHistoricalPrice
    );
  };